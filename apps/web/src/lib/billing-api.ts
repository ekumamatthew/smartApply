import api from "@/app/api/axios"

export type BillingSummary = {
  trial: {
    parseUsed: number
    parseLimit: number
    parseRemaining: number
    generateUsed: number
    generateLimit: number
    generateRemaining: number
  }
  credits: {
    balance: number
    creditsPerUsd: number
    minPurchaseUsdCents: number
  }
  rates: {
    parse: number
    generate: number
  }
}

export async function fetchBillingSummary(): Promise<BillingSummary> {
  const response = await api.get("/api/billing/summary")
  return response.data
}

export async function createCreditCheckout(params: {
  credits: number
  currency: string
}): Promise<{
  orderId: string
  checkoutUrl: string
  credits: number
  amountUsdCents: number
  currency: string
}> {
  const response = await api.post("/api/billing/checkout", params)
  return response.data
}

export async function confirmCreditCheckout(
  orderId: string,
  transactionId: string,
  txRef?: string
): Promise<{ success: boolean; status: string; credited?: number }> {
  const response = await api.post("/api/billing/checkout/confirm", {
    orderId,
    transactionId,
    txRef,
  })
  return response.data
}
