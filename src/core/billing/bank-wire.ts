/**
 * Bank Wire Transfer Support for EmbedAPI Pro Plan
 * Handles bank wire payment requests and reconciliation
 */

import axios from "axios"

export interface BankWirePayment {
	id: string
	amount: number
	currency: "USD" | "EUR" | "MAD"
	status: "pending" | "confirmed" | "rejected"
	reference: string
	bankDetails: {
		accountName: string
		accountNumber: string
		bankName: string
		swiftCode?: string
		iban?: string
		routingNumber?: string
	}
	createdAt: string
	confirmedAt?: string
}

export interface BankWireRequest {
	amount: number
	currency: "USD" | "EUR" | "MAD"
	description?: string
}

export class BankWireBilling {
	private apiKey: string
	private baseUrl: string

	constructor(apiKey: string, baseUrl: string = "https://api.embedapi.com") {
		this.apiKey = apiKey
		this.baseUrl = baseUrl
	}

	/**
	 * Request a bank wire payment
	 * Returns bank details for the user to transfer funds
	 */
	async requestBankWirePayment(request: BankWireRequest): Promise<BankWirePayment> {
		try {
			const response = await axios.post(
				`${this.baseUrl}/v1/billing/bank-wire/request`,
				{
					amount: request.amount,
					currency: request.currency,
					description: request.description,
				},
				{
					headers: {
						Authorization: `Bearer ${this.apiKey}`,
						"Content-Type": "application/json",
					},
				},
			)

			return response.data.payment
		} catch (error: any) {
			throw new Error(`Failed to request bank wire payment: ${error.message}`)
		}
	}

	/**
	 * Get bank wire payment status
	 */
	async getPaymentStatus(paymentId: string): Promise<BankWirePayment> {
		try {
			const response = await axios.get(`${this.baseUrl}/v1/billing/bank-wire/${paymentId}`, {
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
				},
			})

			return response.data.payment
		} catch (error: any) {
			throw new Error(`Failed to fetch payment status: ${error.message}`)
		}
	}

	/**
	 * Get all bank wire payments
	 */
	async getPaymentHistory(limit: number = 10): Promise<BankWirePayment[]> {
		try {
			const response = await axios.get(`${this.baseUrl}/v1/billing/bank-wire/payments`, {
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
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
	 * Get bank account details for a currency
	 */
	async getBankDetails(currency: "USD" | "EUR" | "MAD"): Promise<BankWirePayment["bankDetails"]> {
		try {
			const response = await axios.get(`${this.baseUrl}/v1/billing/bank-wire/details/${currency}`, {
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
				},
			})

			return response.data.bankDetails
		} catch (error: any) {
			throw new Error(`Failed to fetch bank details: ${error.message}`)
		}
	}
}

