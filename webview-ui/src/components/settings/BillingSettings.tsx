import React from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { Section } from "./Section"
import { SectionHeader } from "./SectionHeader"
import { UsageDashboard, PricingPlans, PaymentMethod } from "@src/components/billing"

export const BillingSettings: React.FC = () => {
	const { t } = useAppTranslation()
	const { apiConfiguration, currentApiConfigName } = useExtensionState()

	// Determine EmbedAPI plan type
	// Solo = BYOK (user provides their own API keys)
	// Pro = SaaS (user pays through EmbedAPI)
	const embedApiPlanType: "solo" | "pro" | null = apiConfiguration?.embedApiToken
		? (apiConfiguration.embedApiPlan || "solo") // Default to solo if token exists but no plan specified
		: null

	const handlePlanChange = (plan: "solo" | "pro") => {
		// Update API configuration with new plan
		vscode.postMessage({
			type: "upsertApiConfiguration",
			text: currentApiConfigName,
			apiConfiguration: {
				...apiConfiguration,
				embedApiPlan: plan,
			},
		})
	}

	return (
		<Section>
			<SectionHeader
				title={t("settings:sections.billing", "Billing & Usage")}
				description={t(
					"settings:billing.description",
					"Manage your EmbedAPI plan, view usage statistics, and add credits",
				)}
			/>

			<div className="space-y-6">
				{/* Plan Selection - Show if no plan selected or if user wants to switch */}
				{!embedApiPlanType && apiConfiguration?.embedApiToken && (
					<div>
						<h3 className="text-lg font-semibold mb-4">
							{t("billing:plans.selectPlan", "Select a Plan")}
						</h3>
						<PricingPlans currentPlan={undefined} onSelectPlan={handlePlanChange} />
					</div>
				)}

				{/* Usage Dashboard - Show for all plans */}
				{embedApiPlanType && (
					<div>
						<h3 className="text-lg font-semibold mb-4">
							{t("billing:usage.title", "Usage Dashboard")}
						</h3>
						<UsageDashboard planType={embedApiPlanType} />
					</div>
				)}

				{/* Payment Method - Show only for Pro plan */}
				{embedApiPlanType === "pro" && (
					<div>
						<h3 className="text-lg font-semibold mb-4">
							{t("billing:payment.title", "Add Credits")}
						</h3>
						<PaymentMethod />
					</div>
				)}

				{/* Plan Information */}
				{embedApiPlanType && (
					<div className="border-t pt-6">
						<h3 className="text-lg font-semibold mb-4">
							{t("billing:plans.currentPlan", "Current Plan")}
						</h3>
						<PricingPlans currentPlan={embedApiPlanType} onSelectPlan={handlePlanChange} />
					</div>
				)}

				{/* No EmbedAPI Configuration */}
				{!apiConfiguration?.embedApiToken && (
					<div className="text-center py-8 text-muted-foreground">
						<p>{t("billing:noConfig", "Configure EmbedAPI in the Providers section to enable billing.")}</p>
					</div>
				)}
			</div>
		</Section>
	)
}

