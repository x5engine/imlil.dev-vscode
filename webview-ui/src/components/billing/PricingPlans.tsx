import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui/button"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { Badge } from "@/components/ui/badge"

interface PricingPlan {
	id: "solo" | "pro"
	name: string
	description: string
	features: string[]
	price: string
	priceDescription: string
	cta: string
	popular?: boolean
}

interface PricingPlansProps {
	currentPlan?: "solo" | "pro"
	onSelectPlan: (plan: "solo" | "pro") => void
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ currentPlan, onSelectPlan }) => {
	const { t } = useAppTranslation()

	const plans: PricingPlan[] = [
		{
			id: "solo",
			name: t("billing:plans.solo.name", "Solo Plan"),
			description: t("billing:plans.solo.description", "Bring Your Own Key (BYOK)"),
			features: [
				t("billing:plans.solo.feature1", "Use your own API keys"),
				t("billing:plans.solo.feature2", "No platform fees"),
				t("billing:plans.solo.feature3", "Full control over costs"),
				t("billing:plans.solo.feature4", "Pay providers directly"),
			],
			price: t("billing:plans.solo.price", "Free"),
			priceDescription: t("billing:plans.solo.priceDescription", "Extension is free"),
			cta: t("billing:plans.solo.cta", "Use Solo Plan"),
		},
		{
			id: "pro",
			name: t("billing:plans.pro.name", "Pro Plan"),
			description: t("billing:plans.pro.description", "SaaS with token-based billing"),
			features: [
				t("billing:plans.pro.feature1", "No API key management"),
				t("billing:plans.pro.feature2", "Pay-as-you-go pricing"),
				t("billing:plans.pro.feature3", "Multi-currency support (USD, EUR, MAD)"),
				t("billing:plans.pro.feature4", "Usage dashboard and analytics"),
				t("billing:plans.pro.feature5", "Stripe & bank wire payments"),
			],
			price: t("billing:plans.pro.price", "Pay per use"),
			priceDescription: t("billing:plans.pro.priceDescription", "Token-based billing"),
			cta: t("billing:plans.pro.cta", "Upgrade to Pro"),
			popular: true,
		},
	]

	return (
		<div className="grid md:grid-cols-2 gap-4">
			{plans.map((plan) => {
				const isCurrent = currentPlan === plan.id
				return (
					<Card key={plan.id} className={plan.popular ? "border-primary" : ""}>
						{plan.popular && (
							<div className="absolute -top-3 left-1/2 -translate-x-1/2">
								<Badge variant="default">{t("billing:plans.popular", "Popular")}</Badge>
							</div>
						)}
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								{plan.name}
								{isCurrent && (
									<Badge variant="secondary">{t("billing:plans.current", "Current")}</Badge>
								)}
							</CardTitle>
							<CardDescription>{plan.description}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<div className="text-3xl font-bold">{plan.price}</div>
								<div className="text-sm text-muted-foreground">{plan.priceDescription}</div>
							</div>
							<ul className="space-y-2">
								{plan.features.map((feature, index) => (
									<li key={index} className="flex items-start gap-2">
										<span className="text-primary">✓</span>
										<span className="text-sm">{feature}</span>
									</li>
								))}
							</ul>
							<Button
								variant={plan.popular ? "default" : "outline"}
								className="w-full"
								onClick={() => onSelectPlan(plan.id)}
								disabled={isCurrent}>
								{isCurrent ? t("billing:plans.currentPlan", "Current Plan") : plan.cta}
							</Button>
						</CardContent>
					</Card>
				)
			})}
		</div>
	)
}

