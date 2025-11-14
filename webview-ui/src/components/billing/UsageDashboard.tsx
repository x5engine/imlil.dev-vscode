import React, { useState, useEffect } from "react"
import { vscode } from "@/utils/vscode"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { useAppTranslation } from "@/i18n/TranslationContext"

// kilocode_change start - billing components
type Currency = "USD" | "EUR" | "MAD"

function getCurrencySymbol(currency: Currency): string {
	switch (currency) {
		case "USD":
			return "$"
		case "EUR":
			return "€"
		case "MAD":
			return "د.م."
		default:
			return "$"
	}
}

function formatCost(cost: number, currency: Currency): string {
	const symbol = getCurrencySymbol(currency)
	const formatted = cost.toFixed(6)
	const trimmed = formatted.replace(/\.?0+$/, "")
	return `${symbol}${trimmed}`
}
// kilocode_change end

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
		setIsLoading(true)
		vscode.postMessage({
			type: "fetchEmbedAPIUsageStats",
			payload: { period },
		})
	}, [period])

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
					<CardTitle>{t("billing:solo.title")}</CardTitle>
					<CardDescription>{t("billing:solo.description")}</CardDescription>
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
							<CardTitle>{t("billing:usage.title")}</CardTitle>
							<CardDescription>{t("billing:usage.description")}</CardDescription>
						</div>
						<div className="space-y-1">
							<label className="text-xs font-medium">{t("billing:usage.period")}</label>
							<select
								className="px-2 py-1 text-sm rounded border border-gray-300"
								value={period}
								onChange={(e) => setPeriod(e.target.value as typeof period)}>
								<option value="day">{t("billing:period.day")}</option>
								<option value="week">{t("billing:period.week")}</option>
								<option value="month">{t("billing:period.month")}</option>
								<option value="all">{t("billing:period.all")}</option>
							</select>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="text-center py-8">{t("common:loading")}</div>
					) : stats ? (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="space-y-1">
								<div className="text-sm text-muted-foreground">{t("billing:metrics.totalCost")}</div>
								<div className="text-2xl font-bold">{formatCost(stats.totalCost, stats.currency)}</div>
							</div>
							<div className="space-y-1">
								<div className="text-sm text-muted-foreground">{t("billing:metrics.totalTokens")}</div>
								<div className="text-2xl font-bold">
									{(stats.totalInputTokens + stats.totalOutputTokens).toLocaleString()}
								</div>
							</div>
							<div className="space-y-1">
								<div className="text-sm text-muted-foreground">
									{t("billing:metrics.totalRequests")}
								</div>
								<div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
							</div>
							<div className="space-y-1">
								<div className="text-sm text-muted-foreground">{t("billing:metrics.avgCost")}</div>
								<div className="text-2xl font-bold">
									{stats.totalRequests > 0
										? formatCost(stats.totalCost / stats.totalRequests, stats.currency)
										: formatCost(0, stats.currency)}
								</div>
							</div>
						</div>
					) : (
						<div className="text-center py-8 text-muted-foreground">{t("billing:usage.noData")}</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
