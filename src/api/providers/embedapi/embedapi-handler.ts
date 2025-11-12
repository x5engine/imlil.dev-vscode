import { ApiHandlerOptions, ModelRecord } from "../../shared/api"
import { CompletionUsage, OpenRouterHandler } from "../openrouter"
import { getModelParams } from "../transform/model-params"
import { getModels } from "../fetchers/modelCache"
import { DEEP_SEEK_DEFAULT_TEMPERATURE, openRouterDefaultModelId, openRouterDefaultModelInfo } from "@roo-code/types"
import { ApiHandlerCreateMessageMetadata } from "../index"
import { getModelEndpoints } from "../fetchers/modelEndpointCache"
import { DEFAULT_HEADERS } from "../constants"
import { streamSse } from "../../services/continuedev/core/fetch/stream"
import { EmbedAPIClient } from "./embedapi-client"
import { getEmbedAPIBaseUrl, EMBEDAPI_DEFAULT_FIM_ENDPOINT } from "./embedapi-config"
import { getPlanType, calculateCost, PricingInfo, Currency } from "./pricing"

/**
 * EmbedAPI Handler
 * Main handler that routes all AI requests through EmbedAPI backend
 * Similar to KilocodeOpenrouterHandler but uses EmbedAPI endpoints
 */
export class EmbedAPIHandler extends OpenRouterHandler {
	protected override models: ModelRecord = {}
	defaultModel: string = openRouterDefaultModelId
	private apiFIMBase: string
	private embedAPIClient: EmbedAPIClient

	protected override get providerName() {
		return "EmbedAPI" as const
	}

	constructor(options: ApiHandlerOptions) {
		// Initialize EmbedAPI client
		const baseApiUrl = options.embedApiBaseUrl || getEmbedAPIBaseUrl(options.embedApiToken)
		
		// Create EmbedAPI client
		this.embedAPIClient = new EmbedAPIClient({
			apiKey: options.embedApiToken ?? "",
			baseUrl: baseApiUrl,
			organizationId: options.embedApiOrganizationId,
		})

		// Configure options for OpenRouter-compatible interface
		options = {
			...options,
			openRouterBaseUrl: `${baseApiUrl}/openrouter`,
			openRouterApiKey: options.embedApiToken,
		}

		super(options)

		this.apiFIMBase = baseApiUrl
	}

	override customRequestOptions(metadata?: ApiHandlerCreateMessageMetadata) {
		const headers: Record<string, string> = {}

		if (metadata?.taskId) {
			headers["X-EmbedAPI-Task-ID"] = metadata.taskId
		}

		const embedApiOptions = this.options

		if (embedApiOptions.embedApiOrganizationId) {
			headers["X-EmbedAPI-Organization-ID"] = embedApiOptions.embedApiOrganizationId

			if (metadata?.projectId) {
				headers["X-EmbedAPI-Project-ID"] = metadata.projectId
			}
		}

		return Object.keys(headers).length > 0 ? { headers } : undefined
	}

	override getTotalCost(lastUsage: CompletionUsage): number {
		const model = this.getModel().info
		if (!model.inputPrice && !model.outputPrice) {
			return 0
		}
		
		// Determine plan type (Solo = BYOK, Pro = SaaS)
		const planType = getPlanType(
			this.options.embedApiToken,
			this.options.embedApiPlan
		)
		
		// For BYOK (Solo plan), return upstream cost (user pays provider directly)
		if (planType === "solo" || lastUsage.is_byok) {
			return lastUsage.cost_details?.upstream_inference_cost || 0
		}

		// For Pro plan, calculate cost using EmbedAPI pricing
		// Extract pricing info from model
		const pricing: PricingInfo = {
			inputPrice: model.inputPrice || 0,
			outputPrice: model.outputPrice || 0,
			cacheReadPrice: model.cacheReadsPrice,
			cacheWritePrice: model.cacheWritesPrice,
			currency: "USD" as Currency, // Default to USD, can be enhanced to detect from model
		}
		
		// Calculate cost based on usage
		const usageCost = calculateCost(
			lastUsage.prompt_tokens || 0,
			lastUsage.completion_tokens || 0,
			pricing,
			lastUsage.cache_read_tokens,
			lastUsage.cache_write_tokens
		)
		
		return usageCost.totalCost
	}

	override getModel() {
		let id = this.options.embedApiModel ?? this.defaultModel
		let info = this.models[id] ?? openRouterDefaultModelInfo

		// If a specific provider is requested, use the endpoint for that provider.
		if (this.options.openRouterSpecificProvider && this.endpoints[this.options.openRouterSpecificProvider]) {
			info = this.endpoints[this.options.openRouterSpecificProvider]
		}

		const isDeepSeekR1 = id.startsWith("deepseek/deepseek-r1") || id === "perplexity/sonar-reasoning"

		const params = getModelParams({
			format: "openrouter",
			modelId: id,
			model: info,
			settings: this.options,
			defaultTemperature: isDeepSeekR1 ? DEEP_SEEK_DEFAULT_TEMPERATURE : 0,
		})

		return { id, info, topP: isDeepSeekR1 ? 0.95 : undefined, ...params }
	}

	public override async fetchModel() {
		if (!this.options.embedApiToken || !this.options.openRouterBaseUrl) {
			throw new Error("EmbedAPI token + baseUrl is required to fetch models")
		}

		// Fetch models from EmbedAPI
		const [models, endpoints] = await Promise.all([
			getModels({
				provider: "embedapi",
				embedApiToken: this.options.embedApiToken,
				embedApiOrganizationId: this.options.embedApiOrganizationId,
				embedApiBaseUrl: this.options.embedApiBaseUrl,
			}),
			getModelEndpoints({
				router: "openrouter",
				modelId: this.options.embedApiModel,
				endpoint: this.options.openRouterSpecificProvider,
			}),
		])

		this.models = models
		this.endpoints = endpoints
		
		// Set default model if not specified
		if (!this.options.embedApiModel && Object.keys(models).length > 0) {
			this.defaultModel = Object.keys(models)[0]
		}
		
		return this.getModel()
	}

	supportsFim(): boolean {
		const modelId = this.options.embedApiModel ?? this.defaultModel
		return modelId.includes("codestral") || modelId.includes("fim")
	}

	async completeFim(prefix: string, suffix: string, taskId?: string): Promise<string> {
		let result = ""
		for await (const chunk of this.streamFim(prefix, suffix, taskId)) {
			result += chunk
		}
		return result
	}

	async *streamFim(prefix: string, suffix: string, taskId?: string): AsyncGenerator<string> {
		const model = await this.fetchModel()
		const endpoint = new URL(EMBEDAPI_DEFAULT_FIM_ENDPOINT, this.apiFIMBase)

		// Build headers using EmbedAPI client
		const headers: Record<string, string> = {
			...DEFAULT_HEADERS,
			"Content-Type": "application/json",
			Accept: "application/json",
			...this.embedAPIClient.getHeaders(),
			...this.customRequestOptions(taskId ? { taskId, mode: "code" } : undefined)?.headers,
		}
		
		const max_max_tokens = 1000
		const response = await fetch(endpoint, {
			method: "POST",
			body: JSON.stringify({
				model: model.id,
				prompt: prefix,
				suffix,
				max_tokens: Math.min(max_max_tokens, model.maxTokens ?? max_max_tokens),
				temperature: model.temperature,
				top_p: model.topP,
				stream: true,
			}),
			headers,
		})

		if (!response.ok) {
			const errorText = await response.text()
			throw new Error(`FIM streaming failed: ${response.status} ${response.statusText} - ${errorText}`)
		}

		for await (const data of streamSse(response)) {
			const content = data.choices?.[0]?.delta?.content
			if (content) {
				yield content
			}
		}
	}

	/**
	 * Get EmbedAPI client instance
	 */
	getEmbedAPIClient(): EmbedAPIClient {
		return this.embedAPIClient
	}
}

