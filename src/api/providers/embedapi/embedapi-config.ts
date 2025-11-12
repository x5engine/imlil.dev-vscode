/**
 * EmbedAPI Configuration
 * Configuration constants and utilities for EmbedAPI integration
 */

export const EMBEDAPI_DEFAULT_BASE_URL = "https://api.embedapi.com/v1"
export const EMBEDAPI_DEFAULT_CHAT_ENDPOINT = "/chat/completions"
export const EMBEDAPI_DEFAULT_EMBEDDINGS_ENDPOINT = "/embeddings"
export const EMBEDAPI_DEFAULT_FIM_ENDPOINT = "/fim/completions"
export const EMBEDAPI_DEFAULT_MODELS_ENDPOINT = "/models"

/**
 * Get EmbedAPI base URL from token or use default
 */
export function getEmbedAPIBaseUrl(token?: string, customBaseUrl?: string): string {
	if (customBaseUrl) {
		return customBaseUrl.endsWith("/") ? customBaseUrl.slice(0, -1) : customBaseUrl
	}
	
	// If token contains URL info, extract it (similar to KiloCode pattern)
	// For now, use default
	return EMBEDAPI_DEFAULT_BASE_URL
}

/**
 * EmbedAPI request headers
 */
export function getEmbedAPIHeaders(token: string, organizationId?: string): Record<string, string> {
	const headers: Record<string, string> = {
		"Authorization": `Bearer ${token}`,
		"Content-Type": "application/json",
		"Accept": "application/json",
	}
	
	if (organizationId) {
		headers["X-EmbedAPI-Organization-ID"] = organizationId
	}
	
	return headers
}

