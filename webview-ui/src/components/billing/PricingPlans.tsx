import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui/button"
// kilocode_change start - billing components
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
			name: t("billing:plans.solo.name"),
			description: t("billing:plans.solo.description"),
			features: [
				t("billing:plans.solo.feature1"),
				t("billing:plans.solo.feature2"),
				t("billing:plans.solo.feature3"),
				t("billing:plans.solo.feature4"),
			],
			price: t("billing:plans.solo.price"),
			priceDescription: t("billing:plans.solo.priceDescription"),
			cta: t("billing:plans.solo.cta"),
		},
		{
			id: "pro",
			name: t("billing:plans.pro.name"),
			description: t("billing:plans.pro.description"),
			features: [
				t("billing:plans.pro.feature1"),
				t("billing:plans.pro.feature2"),
				t("billing:plans.pro.feature3"),
				t("billing:plans.pro.feature4"),
				t("billing:plans.pro.feature5"),
			],
			price: t("billing:plans.pro.price"),
			priceDescription: t("billing:plans.pro.priceDescription"),
			cta: t("billing:plans.pro.cta"),
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
								<Badge variant="default">{t("billing:plans.popular")}</Badge>
							</div>
						)}
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								{plan.name}
								{isCurrent && <Badge variant="secondary">{t("billing:plans.current")}</Badge>}
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
								{isCurrent ? t("billing:plans.currentPlan") : plan.cta}
							</Button>
						</CardContent>
					</Card>
				)
			})}
		</div>
	)
}
// kilocode_change end
