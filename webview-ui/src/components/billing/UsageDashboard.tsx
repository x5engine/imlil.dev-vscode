import React, { useState, useEffect } from "react"
import { vscode } from "@/utils/vscode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Select } from "@/components/ui/select"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { formatCost, Currency } from "../../../src/api/providers/embedapi/pricing"

interface UsageStats {
	totalCost: number
	totalInputTokens: number
	totalOutputTokens: number
	totalRequests: number
	currency: Currency
	period: "day" | "week" | "month" | "all"
}

interface UsageDashboardProps {
	planType: "solo" | "pro"
}

export const UsageDashboard: React.FC<UsageDashboardProps> = ({ planType }) => {
	const { t } = useAppTranslation()
	const [stats, setStats] = useState<UsageStats | null>(null)
	const [period, setPeriod] = useState<"day" | "week" | "month" | "all">("month")
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		fetchUsageStats()
	}, [period])

	const fetchUsageStats = async () => {
		setIsLoading(true)
		vscode.postMessage({
			type: "fetchEmbedAPIUsageStats",
			payload: { period },
		})
	}

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			if (message.type === "embedAPIUsageStatsResponse") {
				setStats(message.payload.stats)
				setIsLoading(false)
			}
		}

		window.addEventListener("message", handleMessage)
		return () => window.removeEventListener("message", handleMessage)
	}, [])

	if (planType === "solo") {
		return (
			<Card>
				<CardHeader>
					<CardTitle>{t("billing:solo.title", "Solo Plan (BYOK)")}</CardTitle>
					<CardDescription>
						{t(
							"billing:solo.description",
							"You're using your own API keys. No usage tracking or billing through Imlil.dev.",
						)}
					</CardDescription>
				</CardHeader>
			</Card>
		)
	}

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>{t("billing:usage.title", "Usage Dashboard")}</CardTitle>
							<CardDescription>
								{t("billing:usage.description", "Track your EmbedAPI Pro plan usage and costs")}
							</CardDescription>
						</div>
						<Select
							value={period}
							onValueChange={(value) => setPeriod(value as typeof period)}
							options={[
								{ value: "day", label: t("billing:period.day", "Past Day") },
								{ value: "week", label: t("billing:period.week", "Past Week") },
								{ value: "month", label: t("billing:period.month", "Past Month") },
								{ value: "all", label: t("billing:period.all", "All Time") },
							]}
						/>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="text-center py-8">{t("common:loading", "Loading...")}</div>
					) : stats ? (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="space-y-1">
								<div className="text-sm text-muted-foreground">
									{t("billing:metrics.totalCost", "Total Cost")}
								</div>
								<div className="text-2xl font-bold">
									{formatCost(stats.totalCost, stats.currency)}
								</div>
							</div>
							<div className="space-y-1">
								<div className="text-sm text-muted-foreground">
									{t("billing:metrics.totalTokens", "Total Tokens")}
								</div>
								<div className="text-2xl font-bold">
									{(stats.totalInputTokens + stats.totalOutputTokens).toLocaleString()}
								</div>
							</div>
							<div className="space-y-1">
								<div className="text-sm text-muted-foreground">
									{t("billing:metrics.totalRequests", "Total Requests")}
								</div>
								<div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
							</div>
							<div className="space-y-1">
								<div className="text-sm text-muted-foreground">
									{t("billing:metrics.avgCost", "Avg Cost/Request")}
								</div>
								<div className="text-2xl font-bold">
									{stats.totalRequests > 0
										? formatCost(stats.totalCost / stats.totalRequests, stats.currency)
										: formatCost(0, stats.currency)}
								</div>
							</div>
						</div>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							{t("billing:usage.noData", "No usage data available")}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}

