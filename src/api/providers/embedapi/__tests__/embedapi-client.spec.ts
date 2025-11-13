/**
 * EmbedAPI Client Tests
 * Tests for EmbedAPI client using @embedapi/core
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { EmbedAPIClient } from "../embedapi-client"

// Mock @embedapi/core
vi.mock("@embedapi/core", () => ({
	EmbedAPIClient: vi.fn().mockImplementation(() => ({
		generate: vi.fn(),
		embeddings: {
			create: vi.fn(),
		},
	})),
}))

describe("EmbedAPIClient", () => {
	let client: EmbedAPIClient

	beforeEach(() => {
		client = new EmbedAPIClient({
			apiKey: "test-api-key",
			baseUrl: "https://api.embedapi.com/v1",
		})
	})

	describe("Initialization", () => {
		it("should initialize with API key", () => {
			expect(client).toBeInstanceOf(EmbedAPIClient)
			expect(client.getApiKey()).toBe("test-api-key")
		})

		it("should use default base URL if not provided", () => {
			const clientWithoutUrl = new EmbedAPIClient({
				apiKey: "test-key",
			})
			expect(clientWithoutUrl.getBaseUrl()).toBeDefined()
		})

		it("should throw error if API key is missing", () => {
			expect(() => {
				new EmbedAPIClient({
					apiKey: "",
				})
			}).toThrow("EmbedAPI API key is required")
		})
	})

	describe("Client Methods", () => {
		it("should have generate method", () => {
			expect(typeof client.generate).toBe("function")
		})

		it("should have streamGenerate method", () => {
			expect(typeof client.streamGenerate).toBe("function")
		})

		it("should have createEmbeddings method", () => {
			expect(typeof client.createEmbeddings).toBe("function")
		})

		it("should return base URL", () => {
			expect(client.getBaseUrl()).toBe("https://api.embedapi.com/v1")
		})

		it("should return API key", () => {
			expect(client.getApiKey()).toBe("test-api-key")
		})
	})

	describe("Organization ID", () => {
		it("should store organization ID if provided", () => {
			const clientWithOrg = new EmbedAPIClient({
				apiKey: "test-key",
				organizationId: "org-123",
			})
			expect(clientWithOrg.getOrganizationId()).toBe("org-123")
		})

		it("should return undefined if organization ID not provided", () => {
			expect(client.getOrganizationId()).toBeUndefined()
		})
	})
})

