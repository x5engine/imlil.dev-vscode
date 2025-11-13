import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { vscode } from "@/utils/vscode"
import { EMBEDAPI_BILLING_URL } from "../../../../src/api/providers/embedapi/embedapi-config"

interface PaymentMethodProps {
	onPaymentSuccess?: () => void
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({ onPaymentSuccess }) => {
	const { t } = useAppTranslation()

	const handleOpenBilling = () => {
		// Open billing page in external browser
		vscode.postMessage({
			type: "openInBrowser",
			url: EMBEDAPI_BILLING_URL,
		})
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("billing:payment.title", "Add Credits")}</CardTitle>
				<CardDescription>
					{t(
						"billing:payment.description",
						"Manage your billing and add credits through the EmbedAPI website. The API will return an error when credits are consumed.",
					)}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="text-sm text-muted-foreground">
					{t(
						"billing:payment.websiteNote",
						"All payments and billing management are handled on the EmbedAPI website. Click below to open the billing page.",
					)}
				</div>
				<Button className="w-full" onClick={handleOpenBilling}>
					{t("billing:payment.openBilling", "Open Billing Page")}
				</Button>
				<p className="text-xs text-muted-foreground">
					{t(
						"billing:payment.errorNote",
						"Note: If you run out of credits, the API will return an error. Add credits on the website to continue using the service.",
					)}
				</p>
			</CardContent>
		</Card>
	)
}

