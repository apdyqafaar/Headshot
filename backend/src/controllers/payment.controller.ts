import { paymentService } from "@/services/payment"
import { successResponse } from "@/util/response"
import { Request, Response } from "express"

export const getCreditPackages=async (req:Request, res:Response)=>{
    const creditPackages=await paymentService.getCreditPackages()
    return successResponse(res, creditPackages,"Credit packages retrieved successfully")
}

export const processPayment=async(req:Request, res:Response)=>{
    const {userId, packageId, platform, phone, successUrl, cancelUrl}=req.body
  const paymentResponse=await paymentService.processPayment({cancelUrl,userId,packageId,platform,successUrl,phone})
  return successResponse(res, paymentResponse,"Payment processed successfully")
}