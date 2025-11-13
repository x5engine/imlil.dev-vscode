/**
 * Stripe Integration for EmbedAPI Pro Plan
 * Handles payment processing via Stripe
 */

import axios from "axios"

export interface StripePaymentIntent {
	id: string
	clientSecret: string
	amount: number
	currency: string
	status: string
}

export interface StripeConfig {
	publishableKey: string
	apiKey: string
	webhookSecret?: string
}

export class StripeBilling {
	private config: StripeConfig
	private baseUrl: string

	constructor(config: StripeConfig, baseUrl: string = "https://api.embedapi.com") {
		this.config = config
		this.baseUrl = baseUrl
	}

	/**
	 * Create a payment intent for a subscription or one-time payment
	 */
	async createPaymentIntent(params: {
		amount: number // Amount in cents
		currency: "usd" | "eur" | "mad"
		description?: string
		metadata?: Record<string, string>
	}): Promise<StripePaymentIntent> {
		try {
			const response = await axios.post(
				`${this.baseUrl}/v1/billing/stripe/payment-intent`,
				{
					amount: params.amount,
					currency: params.currency,
					description: params.description,
					metadata: params.metadata,
				},
				{
					headers: {
						Authorization: `Bearer ${this.config.apiKey}`,
						"Content-Type": "application/json",
					},
				},
			)

			return response.data
		} catch (error: any) {
			throw new Error(`Failed to create payment intent: ${error.message}`)
		}
	}

	/**
	 * Confirm a payment intent (after Stripe.js confirmation)
	 */
	async confirmPaymentIntent(paymentIntentId: string): Promise<StripePaymentIntent> {
		try {
			const response = await axios.post(
				`${this.baseUrl}/v1/billing/stripe/confirm-payment`,
				{
					paymentIntentId,
				},
				{
					headers: {
						Authorization: `Bearer ${this.config.apiKey}`,
						"Content-Type": "application/json",
					},
				},
			)

			return response.data
		} catch (error: any) {
			throw new Error(`Failed to confirm payment: ${error.message}`)
		}
	}

	/**
	 * Get payment history
	 */
	async getPaymentHistory(limit: number = 10): Promise<StripePaymentIntent[]> {
		try {
			const response = await axios.get(`${this.baseUrl}/v1/billing/stripe/payments`, {
				headers: {
					Authorization: `Bearer ${this.config.apiKey}`,
				},
				params: {
					limit,
				},
			})

			return response.data.payments || []
		} catch (error: any) {
			throw new Error(`Failed to fetch payment history: ${error.message}`)
		}
	}

	/**
	 * Get publishable key for Stripe.js
	 */
	getPublishableKey(): string {
		return this.config.publishableKey
	}
}

