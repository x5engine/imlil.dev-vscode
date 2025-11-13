import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { vscode } from "@/utils/vscode"
// kilocode_change start
import { EMBEDAPI_BILLING_URL } from "../../../../src/api/providers/embedapi/embedapi-config"

interface PaymentMethodProps {
	onPaymentSuccess?: () => void
}

export const PaymentMethod: React.FC<PaymentMethodProps> = () => {
	const { t } = useAppTranslation()

	const handleOpenBilling = () => {
		// Open billing page in external browser
		vscode.postMessage({
			type: "openInBrowser",
			url: EMBEDAPI_BILLING_URL,
		})
	}
	// kilocode_change end

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("billing:payment.title")}</CardTitle>
				<CardDescription>{t("billing:payment.description")}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="text-sm text-muted-foreground">{t("billing:payment.websiteNote")}</div>
				<Button className="w-full" onClick={handleOpenBilling}>
					{t("billing:payment.openBilling")}
				</Button>
				<p className="text-xs text-muted-foreground">{t("billing:payment.errorNote")}</p>
			</CardContent>
		</Card>
	)
}
