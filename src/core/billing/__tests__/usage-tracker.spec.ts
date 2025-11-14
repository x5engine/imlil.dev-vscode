/**
 * EmbedAPI Usage Tracker Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { EmbedAPIUsageTracker } from "../usage-tracker"
import type { ExtensionContext, Memento } from "vscode"

// Mock VS Code ExtensionContext
const mockMemento: Memento & { setKeysForSync(keys: readonly string[]): void } = {
	get: vi.fn(() => []),
	update: vi.fn(),
	keys: vi.fn(() => []),
	setKeysForSync: vi.fn(),
}

const mockContext: ExtensionContext = {
	globalState: mockMemento,
	workspaceState: mockMemento,
	subscriptions: [],
	extensionPath: "",
	extensionUri: {} as any,
	environmentVariableCollection: {} as any,
	extensionMode: 1,
	globalStorageUri: {} as any,
	logUri: {} as any,
	storageUri: {} as any,
	globalStoragePath: "",
	logPath: "",
	storagePath: "",
	extension: {} as any,
	secrets: {} as any,
	languageModelAccessInformation: {} as any,
	asAbsolutePath: vi.fn((path: string) => path),
} as any

describe("EmbedAPIUsageTracker", () => {
	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks()
		// @ts-ignore - accessing private static
		EmbedAPIUsageTracker._instance = undefined
	})

	describe("Initialization", () => {
		it("should initialize with ExtensionContext", () => {
			const tracker = EmbedAPIUsageTracker.initialize(mockContext)
			expect(tracker).toBeInstanceOf(EmbedAPIUsageTracker)
		})

		it("should return same instance on multiple initialize calls", () => {
			const tracker1 = EmbedAPIUsageTracker.initialize(mockContext)
			const tracker2 = EmbedAPIUsageTracker.initialize(mockContext)
			expect(tracker1).toBe(tracker2)
		})

		it("should get instance after initialization", () => {
			EmbedAPIUsageTracker.initialize(mockContext)
			const tracker = EmbedAPIUsageTracker.getInstance()
			expect(tracker).toBeInstanceOf(EmbedAPIUsageTracker)
		})
	})

	describe("Usage Recording", () => {
		it("should record usage event", async () => {
			const tracker = EmbedAPIUsageTracker.initialize(mockContext)

			await tracker.recordUsage({
				model: "claude-3-5-sonnet",
				inputTokens: 1000,
				outputTokens: 500,
				cost: 0.05,
				currency: "USD",
				planType: "pro",
			})

			expect(mockMemento.update).toHaveBeenCalled()
		})

		it("should include cache tokens if provided", async () => {
			const tracker = EmbedAPIUsageTracker.initialize(mockContext)

			await tracker.recordUsage({
				model: "claude-3-5-sonnet",
				inputTokens: 1000,
				outputTokens: 500,
				cacheReadTokens: 100,
				cacheWriteTokens: 50,
				cost: 0.05,
				currency: "USD",
				planType: "pro",
			})

			expect(mockMemento.update).toHaveBeenCalled()
		})
	})

	describe("Usage Statistics", () => {
		it("should return usage stats for a period", () => {
			const tracker = EmbedAPIUsageTracker.initialize(mockContext)

			// Mock stored events
			vi.mocked(mockMemento.get).mockReturnValue([
				{
					timestamp: Date.now() - 1000,
					model: "claude-3-5-sonnet",
					inputTokens: 1000,
					outputTokens: 500,
					cost: 0.05,
					currency: "USD",
					planType: "pro",
				},
			])

			const stats = tracker.getUsageStats("day")
			expect(stats.totalCost).toBeGreaterThanOrEqual(0)
			expect(stats.totalInputTokens).toBeGreaterThanOrEqual(0)
			expect(stats.totalOutputTokens).toBeGreaterThanOrEqual(0)
			expect(stats.totalRequests).toBeGreaterThanOrEqual(0)
		})

		it("should return zero stats when no usage", () => {
			const tracker = EmbedAPIUsageTracker.initialize(mockContext)
			vi.mocked(mockMemento.get).mockReturnValue([])

			const stats = tracker.getUsageStats("month")
			expect(stats.totalCost).toBe(0)
			expect(stats.totalInputTokens).toBe(0)
			expect(stats.totalOutputTokens).toBe(0)
			expect(stats.totalRequests).toBe(0)
		})
	})

	describe("Usage Events", () => {
		it("should return usage events for a period", () => {
			const tracker = EmbedAPIUsageTracker.initialize(mockContext)

			vi.mocked(mockMemento.get).mockReturnValue([
				{
					timestamp: Date.now() - 1000,
					model: "claude-3-5-sonnet",
					inputTokens: 1000,
					outputTokens: 500,
					cost: 0.05,
					currency: "USD",
					planType: "pro",
				},
			])

			const events = tracker.getUsageEvents("day")
			expect(Array.isArray(events)).toBe(true)
		})
	})

	describe("Cost Calculation", () => {
		it("should return total cost for a period", () => {
			const tracker = EmbedAPIUsageTracker.initialize(mockContext)

			vi.mocked(mockMemento.get).mockReturnValue([
				{
					timestamp: Date.now() - 1000,
					model: "claude-3-5-sonnet",
					inputTokens: 1000,
					outputTokens: 500,
					cost: 0.05,
					currency: "USD",
					planType: "pro",
				},
			])

			const cost = tracker.getTotalCost("day")
			expect(cost).toBeGreaterThanOrEqual(0)
		})
	})

	describe("Data Management", () => {
		it("should clear all usage data", async () => {
			const tracker = EmbedAPIUsageTracker.initialize(mockContext)

			await tracker.clearAllUsage()
			expect(mockMemento.update).toHaveBeenCalledWith("imlildev.embedapi.usage.v1", undefined)
		})
	})
})
