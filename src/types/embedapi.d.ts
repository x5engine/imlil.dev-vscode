// kilocode_change - new file
declare module "@embedapi/core" {
	export interface EmbedAPIClientOptions {
		apiKey: string
		baseURL?: string
		organizationId?: string
	}

	export interface EmbedAPIResponse {
		choices?: Array<{
			message?: {
				content?: string
			}
		}>
		usage?: {
			prompt_tokens?: number
			completion_tokens?: number
		}
	}

	export interface EmbedAPIEmbeddingsResponse {
		data?: Array<{
			embedding?: number[]
		}>
		usage?: {
			prompt_tokens?: number
		}
	}

	export class EmbedAPIClient {
		constructor(options: EmbedAPIClientOptions)
		generate(params: any): Promise<EmbedAPIResponse>
		streamGenerate(params: any): Promise<any>
		embeddings: {
			create(params: any): Promise<EmbedAPIEmbeddingsResponse>
		}
	}
}
