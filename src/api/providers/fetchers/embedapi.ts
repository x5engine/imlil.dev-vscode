import axios from "axios"
import { z } from "zod"
import type { ModelInfo } from "@roo-code/types"
import { parseApiPrice } from "../../../shared/cost"
import { DEFAULT_HEADERS } from "../constants"
import { getEmbedAPIBaseUrl, getEmbedAPIHeaders } from "../embedapi/embedapi-config"

/**
 * EmbedAPI Model Schema (OpenAI-compatible)
 */
const embedapiModelSchema = z.object({
	id: z.string(),
	object: z.string().optional(),
	created: z.number().optional(),
	owned_by: z.string().optional(),
	context_length: z.number().optional(),
	pricing: z
		.object({
			prompt: z.string().optional(),
			completion: z.string().optional(),
		})
		.optional(),
})

type EmbedAPIModel = z.infer<typeof embedapiModelSchema>

/**
 * EmbedAPI Models Response
 */
const embedapiModelsResponseSchema = z.object({
	data: z.array(embedapiModelSchema),
})

type EmbedAPIModelsResponse = z.infer<typeof embedapiModelsResponseSchema>

/**
 * Get models from EmbedAPI
 */
export async function getEmbedAPIModels(
	apiKey: string,
	baseUrl?: string,
	organizationId?: string,
): Promise<Record<string, ModelInfo>> {
	const url = baseUrl || getEmbedAPIBaseUrl(apiKey)
	const modelsEndpoint = `${url}/models`
	const headers = getEmbedAPIHeaders(apiKey, organizationId)

	try {
		const response = await axios.get<EmbedAPIModelsResponse>(modelsEndpoint, {
			headers: {
				...DEFAULT_HEADERS,
				...headers,
			},
		})

		const models: Record<string, ModelInfo> = {}

		for (const model of response.data.data) {
			const inputPrice = model.pricing?.prompt ? parseApiPrice(model.pricing.prompt) : undefined
			const outputPrice = model.pricing?.completion ? parseApiPrice(model.pricing.completion) : undefined

			models[model.id] = {
				maxTokens: model.context_length || 8192,
				contextWindow: model.context_length || 8192,
				inputPrice,
				outputPrice,
				supportsImages: false, // Can be enhanced based on model capabilities
				supportsPromptCache: false, // Can be enhanced
			}
		}

		return models
	} catch (error) {
		console.error("Failed to fetch EmbedAPI models:", error)
		// Return empty models on error, will fall back to defaults
		return {}
	}
}

