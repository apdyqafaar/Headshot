import { api } from "../api";
import { CreditPackage, ProcessPaymentParams,PaymentResponse } from "../types";


export async function getCreditPackage():Promise<CreditPackage[]> {
    return await api.get<CreditPackage[]>("/payment/packages") || []
}

export async function processPayment(params:ProcessPaymentParams):Promise<PaymentResponse> {
   return api.post<PaymentResponse>('/payment/process', params)
}