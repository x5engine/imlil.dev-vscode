/**
 * EmbedAPI Pricing Tests
 * Tests for pricing calculation and plan detection
 */

import { describe, it, expect } from "vitest"
import {
	calculateCost,
	formatCost,
	getCurrencySymbol,
	getPlanType,
	isSoloPlan,
	isProPlan,
	type PricingInfo,
	type Currency,
} from "../pricing"

describe("Pricing Calculation", () => {
	const mockPricing: PricingInfo = {
		inputPrice: 3.0, // $3 per million tokens
		outputPrice: 15.0, // $15 per million tokens
		cacheReadPrice: 0.25, // $0.25 per million tokens
		cacheWritePrice: 0.25, // $0.25 per million tokens
		currency: "USD",
	}

	describe("calculateCost", () => {
		it("should calculate cost for input and output tokens", () => {
			const result = calculateCost(1000000, 500000, mockPricing)
			
			expect(result.inputCost).toBe(3.0) // 1M tokens * $3/M
			expect(result.outputCost).toBe(7.5) // 0.5M tokens * $15/M
			expect(result.totalCost).toBe(10.5)
			expect(result.currency).toBe("USD")
		})

		it("should include cache read tokens in cost", () => {
			const result = calculateCost(1000000, 500000, mockPricing, 100000)
			
			expect(result.cacheReadCost).toBe(0.025) // 0.1M tokens * $0.25/M
			expect(result.totalCost).toBeGreaterThan(10.5)
		})

		it("should include cache write tokens in cost", () => {
			const result = calculateCost(1000000, 500000, mockPricing, undefined, 50000)
			
			expect(result.cacheWriteCost).toBe(0.0125) // 0.05M tokens * $0.25/M
			expect(result.totalCost).toBeGreaterThan(10.5)
		})

		it("should handle zero tokens", () => {
			const result = calculateCost(0, 0, mockPricing)
			
			expect(result.totalCost).toBe(0)
			expect(result.inputCost).toBe(0)
			expect(result.outputCost).toBe(0)
		})
	})

	describe("formatCost", () => {
		it("should format USD cost", () => {
			expect(formatCost(10.5, "USD")).toBe("$10.5")
		})

		it("should format EUR cost", () => {
			expect(formatCost(10.5, "EUR")).toBe("€10.5")
		})

		it("should format MAD cost", () => {
			expect(formatCost(10.5, "MAD")).toBe("د.م.10.5")
		})

		it("should remove trailing zeros", () => {
			expect(formatCost(10.0, "USD")).toBe("$10")
		})
	})

	describe("getCurrencySymbol", () => {
		it("should return correct symbol for USD", () => {
			expect(getCurrencySymbol("USD")).toBe("$")
		})

		it("should return correct symbol for EUR", () => {
			expect(getCurrencySymbol("EUR")).toBe("€")
		})

		it("should return correct symbol for MAD", () => {
			expect(getCurrencySymbol("MAD")).toBe("د.م.")
		})
	})

	describe("Plan Type Detection", () => {
		describe("getPlanType", () => {
			it("should return explicit plan type", () => {
				expect(getPlanType("token", "pro")).toBe("pro")
				expect(getPlanType("token", "solo")).toBe("solo")
			})

			it("should default to solo when token exists but no plan", () => {
				expect(getPlanType("token", undefined)).toBe("solo")
			})

			it("should default to pro when no token", () => {
				expect(getPlanType(undefined, undefined)).toBe("pro")
			})
		})

		describe("isSoloPlan", () => {
			it("should return true for solo plan", () => {
				expect(isSoloPlan("solo")).toBe(true)
			})

			it("should return false for pro plan", () => {
				expect(isSoloPlan("pro")).toBe(false)
			})
		})

		describe("isProPlan", () => {
			it("should return true for pro plan", () => {
				expect(isProPlan("pro")).toBe(true)
			})

			it("should return false for solo plan", () => {
				expect(isProPlan("solo")).toBe(false)
			})
		})
	})
})

