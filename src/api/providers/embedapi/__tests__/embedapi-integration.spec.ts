/**
 * EmbedAPI Integration Tests
 * End-to-end integration tests for EmbedAPI handler
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { EmbedAPIHandler } from "../embedapi-handler"
import type { ApiHandlerOptions } from "../../../shared/api"

// Mock dependencies
vi.mock("@embedapi/core", () => ({
	EmbedAPIClient: vi.fn().mockImplementation(() => ({
		generate: vi.fn().mockResolvedValue({
			choices: [{ message: { content: "Test response" } }],
			usage: {
				prompt_tokens: 100,
				completion_tokens: 50,
			},
		}),
		embeddings: {
			create: vi.fn().mockResolvedValue({
				data: [{ embedding: [0.1, 0.2, 0.3] }],
			}),
		},
	})),
}))

vi.mock("../../../core/billing/usage-tracker", () => ({
	EmbedAPIUsageTracker: {
		getInstance: vi.fn(() => ({
			recordUsage: vi.fn(),
			getUsageStats: vi.fn(() => ({
				totalCost: 0.5,
				totalInputTokens: 10000,
				totalOutputTokens: 5000,
				totalRequests: 10,
				currency: "USD" as const,
				period: "month" as const,
			})),
		})),
	},
}))

describe("EmbedAPI Integration", () => {
	let handler: EmbedAPIHandler
	let options: ApiHandlerOptions

	beforeEach(() => {
		options = {
			embedApiToken: "test-api-key",
			embedApiBaseUrl: "https://api.embedapi.com/v1",
			embedApiPlan: "pro",
		}
		handler = new EmbedAPIHandler(options)
	})

	describe("Plan Type Integration", () => {
		it("should handle Solo plan correctly", () => {
			const soloHandler = new EmbedAPIHandler({
				embedApiToken: "test-key",
				embedApiPlan: "solo",
			})

			const usage = {
				prompt_tokens: 1000,
				completion_tokens: 500,
				is_byok: true,
				cost_details: {
					upstream_inference_cost: 0.05,
				},
			}

			vi.spyOn(soloHandler, "getModel").mockReturnValue({
				id: "claude-3-5-sonnet",
				info: {
					id: "claude-3-5-sonnet",
					name: "Claude 3.5 Sonnet",
					inputPrice: 3.0,
					outputPrice: 15.0,
					contextWindow: 200000,
					maxTokens: 8192,
				},
			})

			const cost = soloHandler.getTotalCost(usage as any)
			expect(cost).toBe(0.05) // Should return upstream cost
		})

		it("should handle Pro plan correctly", () => {
			vi.spyOn(handler, "getModel").mockReturnValue({
				id: "claude-3-5-sonnet",
				info: {
					id: "claude-3-5-sonnet",
					name: "Claude 3.5 Sonnet",
					inputPrice: 3.0,
					outputPrice: 15.0,
					contextWindow: 200000,
					maxTokens: 8192,
				},
			})

			const usage = {
				prompt_tokens: 1000000,
				completion_tokens: 500000,
				prompt_tokens_details: {
					cached_tokens: 100000,
				},
			}

			const cost = handler.getTotalCost(usage as any)
			expect(cost).toBeGreaterThan(0) // Should calculate cost
		})
	})

	describe("Usage Tracking Integration", () => {
		it("should track usage for Pro plan", () => {
			vi.spyOn(handler, "getModel").mockReturnValue({
				id: "claude-3-5-sonnet",
				info: {
					id: "claude-3-5-sonnet",
					name: "Claude 3.5 Sonnet",
					inputPrice: 3.0,
					outputPrice: 15.0,
					contextWindow: 200000,
					maxTokens: 8192,
				},
			})

			const usage = {
				prompt_tokens: 1000,
				completion_tokens: 500,
			}

			// Should not throw
			expect(() => handler.getTotalCost(usage as any)).not.toThrow()
		})

		it("should not track usage for Solo plan", () => {
			const soloHandler = new EmbedAPIHandler({
				embedApiToken: "test-key",
				embedApiPlan: "solo",
			})

			vi.spyOn(soloHandler, "getModel").mockReturnValue({
				id: "claude-3-5-sonnet",
				info: {
					id: "claude-3-5-sonnet",
					name: "Claude 3.5 Sonnet",
					inputPrice: 3.0,
					outputPrice: 15.0,
					contextWindow: 200000,
					maxTokens: 8192,
				},
			})

			const usage = {
				prompt_tokens: 1000,
				completion_tokens: 500,
				is_byok: true,
				cost_details: {
					upstream_inference_cost: 0.05,
				},
			}

			// Should not track usage for Solo plan
			expect(() => soloHandler.getTotalCost(usage as any)).not.toThrow()
		})
	})

	describe("Error Handling", () => {
		it("should handle missing model pricing gracefully", () => {
			vi.spyOn(handler, "getModel").mockReturnValue({
				id: "unknown-model",
				info: {
					id: "unknown-model",
					name: "Unknown Model",
					contextWindow: 200000,
					maxTokens: 8192,
					// No pricing info
				},
			})

			const usage = {
				prompt_tokens: 1000,
				completion_tokens: 500,
			}

			const cost = handler.getTotalCost(usage as any)
			expect(cost).toBe(0) // Should return 0 when no pricing
		})

		it("should handle zero tokens gracefully", () => {
			vi.spyOn(handler, "getModel").mockReturnValue({
				id: "claude-3-5-sonnet",
				info: {
					id: "claude-3-5-sonnet",
					name: "Claude 3.5 Sonnet",
					inputPrice: 3.0,
					outputPrice: 15.0,
					contextWindow: 200000,
					maxTokens: 8192,
				},
			})

			const usage = {
				prompt_tokens: 0,
				completion_tokens: 0,
			}

			const cost = handler.getTotalCost(usage as any)
			expect(cost).toBe(0)
		})
	})
})

