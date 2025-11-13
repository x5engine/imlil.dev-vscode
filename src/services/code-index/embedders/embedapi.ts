import { OpenAICompatibleEmbedder } from "./openai-compatible"
import { IEmbedder, EmbeddingResponse, EmbedderInfo } from "../interfaces/embedder"
import { MAX_ITEM_TOKENS } from "../constants"
import { t } from "../../../i18n"
import { TelemetryEventName } from "@roo-code/types"
import { TelemetryService } from "@roo-code/telemetry"
import { getEmbedAPIBaseUrl } from "../../../api/providers/embedapi/embedapi-config"

/**
 * EmbedAPI embedder implementation that wraps the OpenAI Compatible embedder
 * with configuration for EmbedAPI's embedding API.
 *
 * This routes all embedding requests through EmbedAPI backend.
 */
export class EmbedAPIEmbedder implements IEmbedder {
	private readonly openAICompatibleEmbedder: OpenAICompatibleEmbedder
	private static readonly DEFAULT_MODEL = "text-embedding-3-small"
	private readonly modelId: string
	private readonly baseUrl: string

	/**
	 * Creates a new EmbedAPI embedder
	 * @param apiKey The EmbedAPI token for authentication
	 * @param modelId The model ID to use (defaults to text-embedding-3-small)
	 * @param baseUrl Optional base URL for EmbedAPI (defaults to production)
	 */
	constructor(apiKey: string, modelId?: string, baseUrl?: string) {
		if (!apiKey) {
			throw new Error(t("embeddings:validation.apiKeyRequired"))
		}

		// Use provided model or default
		this.modelId = modelId || EmbedAPIEmbedder.DEFAULT_MODEL
		this.baseUrl = baseUrl || getEmbedAPIBaseUrl(apiKey)

		// Create an OpenAI Compatible embedder with EmbedAPI's configuration
		this.openAICompatibleEmbedder = new OpenAICompatibleEmbedder(
			this.baseUrl,
			apiKey,
			this.modelId,
			MAX_ITEM_TOKENS,
		)
	}

	/**
	 * Creates embeddings for the given texts using EmbedAPI's embedding API
	 * @param texts Array of text strings to embed
	 * @param model Optional model identifier (uses constructor model if not provided)
	 * @returns Promise resolving to embedding response
	 */
	async createEmbeddings(texts: string[], model?: string): Promise<EmbeddingResponse> {
		return this.openAICompatibleEmbedder.createEmbeddings(texts, model)
	}

	/**
	 * Validates the EmbedAPI embedder configuration by testing connectivity and credentials
	 * @returns Promise resolving to validation result with success status and optional error message
	 */
	async validateConfiguration(): Promise<{ valid: boolean; error?: string }> {
		return this.openAICompatibleEmbedder.validateConfiguration()
	}

	/**
	 * Get embedder information
	 */
	get embedderInfo(): EmbedderInfo {
		return {
			name: "embedapi", // kilocode_change
		}
	}
}
