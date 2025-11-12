/**
 * EmbedAPI Pricing Calculation
 * 
 * Handles pricing for both Solo (BYOK) and Pro (SaaS) plans
 * Supports multi-currency: USD, EUR, MAD (Moroccan Dirham)
 */

export type Currency = "USD" | "EUR" | "MAD"
export type PlanType = "solo" | "pro"

export interface PricingInfo {
	inputPrice: number // Price per million input tokens
	outputPrice: number // Price per million output tokens
	cacheReadPrice?: number // Price per million cache read tokens
	cacheWritePrice?: number // Price per million cache write tokens
	currency: Currency
}

export interface UsageCost {
	inputCost: number
	outputCost: number
	cacheReadCost?: number
	cacheWriteCost?: number
	totalCost: number
	currency: Currency
}

/**
 * Convert price string from API (e.g., "0.001" or "$0.001") to number
 */
export function parsePrice(priceString?: string): number {
	if (!priceString) return 0
	
	// Remove currency symbols and whitespace
	const cleaned = priceString.replace(/[$€£,\s]/g, "")
	const parsed = parseFloat(cleaned)
	
	return isNaN(parsed) ? 0 : parsed
}

/**
 * Calculate cost based on token usage
 */
export function calculateCost(
	inputTokens: number,
	outputTokens: number,
	pricing: PricingInfo,
	cacheReadTokens?: number,
	cacheWriteTokens?: number
): UsageCost {
	const inputCost = (inputTokens / 1_000_000) * pricing.inputPrice
	const outputCost = (outputTokens / 1_000_000) * pricing.outputPrice
	
	let cacheReadCost = 0
	let cacheWriteCost = 0
	
	if (cacheReadTokens && pricing.cacheReadPrice) {
		cacheReadCost = (cacheReadTokens / 1_000_000) * pricing.cacheReadPrice
	}
	
	if (cacheWriteTokens && pricing.cacheWritePrice) {
		cacheWriteCost = (cacheWriteTokens / 1_000_000) * pricing.cacheWritePrice
	}
	
	const totalCost = inputCost + outputCost + cacheReadCost + cacheWriteCost
	
	return {
		inputCost,
		outputCost,
		cacheReadCost: cacheReadTokens ? cacheReadCost : undefined,
		cacheWriteCost: cacheWriteTokens ? cacheWriteCost : undefined,
		totalCost,
		currency: pricing.currency,
	}
}

/**
 * Format cost for display
 */
export function formatCost(cost: number, currency: Currency): string {
	const symbol = getCurrencySymbol(currency)
	const formatted = cost.toFixed(6) // Show 6 decimal places for precision
	
	// Remove trailing zeros
	const trimmed = formatted.replace(/\.?0+$/, "")
	
	return `${symbol}${trimmed}`
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
	switch (currency) {
		case "USD":
			return "$"
		case "EUR":
			return "€"
		case "MAD":
			return "د.م." // Moroccan Dirham symbol
		default:
			return ""
	}
}

/**
 * Convert between currencies (basic conversion rates)
 * Note: In production, use real-time exchange rates from an API
 */
export function convertCurrency(
	amount: number,
	from: Currency,
	to: Currency
): number {
	if (from === to) return amount
	
	// Basic conversion rates (update with real-time rates in production)
	const rates: Record<Currency, Record<Currency, number>> = {
		USD: {
			EUR: 0.92,
			MAD: 10.0,
		},
		EUR: {
			USD: 1.09,
			MAD: 10.87,
		},
		MAD: {
			USD: 0.1,
			EUR: 0.092,
		},
	}
	
	const rate = rates[from]?.[to] || 1
	return amount * rate
}

/**
 * Determine plan type based on configuration
 * Solo = BYOK (Bring Your Own Key) - user provides their own API keys
 * Pro = SaaS - user pays for usage through EmbedAPI
 */
export function getPlanType(embedApiToken?: string, embedApiPlan?: PlanType): PlanType {
	// If plan is explicitly set, use it
	if (embedApiPlan) {
		return embedApiPlan
	}
	
	// If token exists but no plan specified, default to Solo (BYOK)
	if (embedApiToken) {
		return "solo"
	}
	
	// Default to Pro if no token (SaaS mode)
	return "pro"
}

/**
 * Check if user is on Solo plan (BYOK)
 */
export function isSoloPlan(planType: PlanType): boolean {
	return planType === "solo"
}

/**
 * Check if user is on Pro plan (SaaS)
 */
export function isProPlan(planType: PlanType): boolean {
	return planType === "pro"
}

