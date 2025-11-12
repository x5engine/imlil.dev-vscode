import { EmbedAPIClient as CoreEmbedAPIClient } from "@embedapi/core"
import { getEmbedAPIBaseUrl } from "./embedapi-config"

/**
 * EmbedAPI Client
 * Wrapper around @embedapi/core for communicating with EmbedAPI backend
 * Uses the official EmbedAPI npm package for generation and streaming
 */
export class EmbedAPIClient {
	private client: CoreEmbedAPIClient
	private baseUrl: string
	private apiKey: string
	private organizationId?: string

	constructor(options: {
		apiKey: string
		baseUrl?: string
		organizationId?: string
	}) {
		if (!options.apiKey) {
			throw new Error("EmbedAPI API key is required")
		}

		this.apiKey = options.apiKey
		this.organizationId = options.organizationId
		this.baseUrl = options.baseUrl || getEmbedAPIBaseUrl(options.apiKey)

		// Initialize the official EmbedAPI client
		this.client = new CoreEmbedAPIClient({
			apiKey: this.apiKey,
			baseURL: this.baseUrl,
			organizationId: this.organizationId,
		})
	}

	/**
	 * Get the underlying EmbedAPI core client
	 */
	getClient(): CoreEmbedAPIClient {
		return this.client
	}

	/**
	 * Get base URL
	 */
	getBaseUrl(): string {
		return this.baseUrl
	}

	/**
	 * Get API key
	 */
	getApiKey(): string {
		return this.apiKey
	}

	/**
	 * Get organization ID
	 */
	getOrganizationId(): string | undefined {
		return this.organizationId
	}

	/**
	 * Create custom headers for requests
	 * Note: @embedapi/core handles headers internally, but this is kept for compatibility
	 */
	getHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
		const headers: Record<string, string> = {
			...(additionalHeaders || {}),
		}

		if (this.organizationId) {
			headers["X-EmbedAPI-Organization-ID"] = this.organizationId
		}

		return headers
	}

	/**
	 * Generate text using EmbedAPI
	 * Uses the official @embedapi/core generate method
	 */
	async generate(options: {
		model: string
		messages: Array<{ role: string; content: string }>
		temperature?: number
		maxTokens?: number
		stream?: boolean
	}): Promise<any> {
		return this.client.generate({
			model: options.model,
			messages: options.messages,
			temperature: options.temperature,
			maxTokens: options.maxTokens,
			stream: options.stream,
		})
	}

	/**
	 * Stream text generation using EmbedAPI
	 * Uses the official @embedapi/core streaming capabilities
	 */
	async *streamGenerate(options: {
		model: string
		messages: Array<{ role: string; content: string }>
		temperature?: number
		maxTokens?: number
	}): AsyncGenerator<string> {
		const stream = await this.client.generate({
			model: options.model,
			messages: options.messages,
			temperature: options.temperature,
			maxTokens: options.maxTokens,
			stream: true,
		})

		// Handle streaming response from @embedapi/core
		if (stream && typeof stream === "object" && "asyncIterator" in stream) {
			for await (const chunk of stream as AsyncIterable<any>) {
				if (chunk?.choices?.[0]?.delta?.content) {
					yield chunk.choices[0].delta.content
				}
			}
		}
	}

	/**
	 * Create embeddings using EmbedAPI
	 */
	async createEmbeddings(options: {
		model: string
		input: string | string[]
	}): Promise<any> {
		return this.client.embeddings.create({
			model: options.model,
			input: options.input,
		})
	}
}
