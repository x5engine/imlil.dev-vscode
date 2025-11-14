import { ApiHandlerOptions, ModelRecord } from "../../../shared/api"
import { CompletionUsage, OpenRouterHandler } from "../openrouter"
import { getModelParams } from "../../transform/model-params"
import { getModels } from "../fetchers/modelCache"
import { DEEP_SEEK_DEFAULT_TEMPERATURE, openRouterDefaultModelId, openRouterDefaultModelInfo } from "@roo-code/types"
import { ApiHandlerCreateMessageMetadata } from "../../index"
import { getModelEndpoints } from "../fetchers/modelEndpointCache"
import { DEFAULT_HEADERS } from "../constants"
import { streamSse } from "../../../services/continuedev/core/fetch/stream"
import { EmbedAPIClient } from "./embedapi-client"
import { getEmbedAPIBaseUrl, EMBEDAPI_DEFAULT_FIM_ENDPOINT } from "./embedapi-config"
import { getPlanType, calculateCost, PricingInfo, Currency } from "./pricing"
import { EmbedAPIUsageTracker } from "../../../core/billing/usage-tracker"

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
		return "OpenRouter" as const
	}

	constructor(options: ApiHandlerOptions) {
		// Initialize base options
		const baseApiUrl = options.embedApiBaseUrl || getEmbedAPIBaseUrl(options.embedApiToken)

		// Configure options for OpenRouter-compatible interface
		const configuredOptions: ApiHandlerOptions = {
			...options,
			openRouterBaseUrl: `${baseApiUrl}/openrouter`,
			openRouterApiKey: options.embedApiToken,
		}

		// Call parent constructor first
		super(configuredOptions)

		// Now initialize EmbedAPI client after super()
		this.embedAPIClient = new EmbedAPIClient({
			apiKey: options.embedApiToken ?? "",
			baseUrl: baseApiUrl,
			organizationId: options.embedApiOrganizationId,
		})

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
		const planType = getPlanType(this.options.embedApiToken, this.options.embedApiPlan)

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

		// Extract cache tokens from prompt_tokens_details if available
		const cacheReadTokens = lastUsage.prompt_tokens_details?.cached_tokens
		const cacheWriteTokens = undefined // Cache write tokens not in CompletionUsage, would need to be tracked separately

		// Calculate cost based on usage
		const usageCost = calculateCost(
			lastUsage.prompt_tokens || 0,
			lastUsage.completion_tokens || 0,
			pricing,
			cacheReadTokens,
			cacheWriteTokens,
		)

		// Record usage for Pro plan users
		if (planType === "pro") {
			this.recordUsage({
				model: this.getModel().id,
				inputTokens: lastUsage.prompt_tokens || 0,
				outputTokens: lastUsage.completion_tokens || 0,
				cacheReadTokens,
				cacheWriteTokens,
				cost: usageCost.totalCost,
				currency: pricing.currency,
				planType: "pro",
			}).catch((error) => {
				console.error("Failed to record usage:", error)
			})
		}

		return usageCost.totalCost
	}

	/**
	 * Record usage event for tracking and billing
	 */
	private async recordUsage(event: {
		model: string
		inputTokens: number
		outputTokens: number
		cacheReadTokens?: number
		cacheWriteTokens?: number
		cost: number
		currency: Currency
		planType: "solo" | "pro"
	}): Promise<void> {
		try {
			const tracker = EmbedAPIUsageTracker.getInstance()
			await tracker.recordUsage(event)
		} catch (error) {
			// Silently fail - usage tracking shouldn't break the main flow
			console.warn("Failed to record EmbedAPI usage:", error)
		}
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
