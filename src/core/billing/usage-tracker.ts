/**
 * EmbedAPI Usage Tracker
 * Tracks token usage and costs for EmbedAPI Pro plan users
 */

import type { ExtensionContext, Memento } from "vscode"
import { ContextProxy } from "../config/ContextProxy"
import { formatCost, Currency } from "../../api/providers/embedapi/pricing"

export interface EmbedAPIUsageEvent {
	timestamp: number
	model: string
	inputTokens: number
	outputTokens: number
	cacheReadTokens?: number
	cacheWriteTokens?: number
	cost: number
	currency: Currency
	planType: "solo" | "pro"
}

export interface UsageStats {
	totalCost: number
	totalInputTokens: number
	totalOutputTokens: number
	totalRequests: number
	currency: Currency
	period: "day" | "week" | "month" | "all"
}

const USAGE_STORAGE_KEY = "imlildev.embedapi.usage.v1"
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONE_WEEK_MS = 7 * ONE_DAY_MS
const ONE_MONTH_MS = 30 * ONE_DAY_MS

export class EmbedAPIUsageTracker {
	private static _instance: EmbedAPIUsageTracker
	private memento: Memento

	private constructor(context: ExtensionContext) {
		this.memento = context.globalState
	}

	public static initialize(context: ExtensionContext): EmbedAPIUsageTracker {
		if (!EmbedAPIUsageTracker._instance) {
			EmbedAPIUsageTracker._instance = new EmbedAPIUsageTracker(context)
		}
		return EmbedAPIUsageTracker._instance
	}

	public static getInstance(): EmbedAPIUsageTracker {
		if (!EmbedAPIUsageTracker._instance) {
			EmbedAPIUsageTracker.initialize(ContextProxy.instance.rawContext)
		}
		return EmbedAPIUsageTracker._instance
	}

	/**
	 * Record a usage event
	 */
	public async recordUsage(event: Omit<EmbedAPIUsageEvent, "timestamp">): Promise<void> {
		const usageEvent: EmbedAPIUsageEvent = {
			...event,
			timestamp: Date.now(),
		}

		const allEvents = this.getPrunedEvents()
		allEvents.push(usageEvent)

		await this.memento.update(USAGE_STORAGE_KEY, allEvents)
	}

	/**
	 * Get usage statistics for a time period
	 */
	public getUsageStats(period: "day" | "week" | "month" | "all" = "month"): UsageStats {
		const now = Date.now()
		let startTime: number

		switch (period) {
			case "day":
				startTime = now - ONE_DAY_MS
				break
			case "week":
				startTime = now - ONE_WEEK_MS
				break
			case "month":
				startTime = now - ONE_MONTH_MS
				break
			case "all":
				startTime = 0
				break
		}

		const allEvents = this.getPrunedEvents()
		const relevantEvents = allEvents.filter((event) => event.timestamp >= startTime)

		const stats = relevantEvents.reduce<UsageStats>(
			(acc, event) => {
				acc.totalCost += event.cost
				acc.totalInputTokens += event.inputTokens
				acc.totalOutputTokens += event.outputTokens
				acc.totalRequests += 1
				acc.currency = event.currency // Use last event's currency
				return acc
			},
			{
				totalCost: 0,
				totalInputTokens: 0,
				totalOutputTokens: 0,
				totalRequests: 0,
				currency: "USD",
				period,
			},
		)

		return stats
	}

	/**
	 * Get usage events for a time period
	 */
	public getUsageEvents(period: "day" | "week" | "month" | "all" = "month"): EmbedAPIUsageEvent[] {
		const now = Date.now()
		let startTime: number

		switch (period) {
			case "day":
				startTime = now - ONE_DAY_MS
				break
			case "week":
				startTime = now - ONE_WEEK_MS
				break
			case "month":
				startTime = now - ONE_MONTH_MS
				break
			case "all":
				startTime = 0
				break
		}

		const allEvents = this.getPrunedEvents()
		return allEvents.filter((event) => event.timestamp >= startTime)
	}

	/**
	 * Get total cost for a period
	 */
	public getTotalCost(period: "day" | "week" | "month" | "all" = "month"): number {
		return this.getUsageStats(period).totalCost
	}

	/**
	 * Clear all usage data
	 */
	public async clearAllUsage(): Promise<void> {
		await this.memento.update(USAGE_STORAGE_KEY, undefined)
	}

	/**
	 * Get pruned events (remove events older than 90 days)
	 */
	private getPrunedEvents(): EmbedAPIUsageEvent[] {
		const allEvents = this.memento.get<EmbedAPIUsageEvent[]>(USAGE_STORAGE_KEY, [])
		const cutoff = Date.now() - 90 * ONE_DAY_MS // Keep 90 days of history
		return allEvents.filter((event) => event.timestamp >= cutoff)
	}

	/**
	 * Format usage stats for display
	 */
	public formatUsageStats(stats: UsageStats): {
		cost: string
		tokens: string
		requests: string
	} {
		return {
			cost: formatCost(stats.totalCost, stats.currency),
			tokens: (stats.totalInputTokens + stats.totalOutputTokens).toLocaleString(),
			requests: stats.totalRequests.toLocaleString(),
		}
	}
}

