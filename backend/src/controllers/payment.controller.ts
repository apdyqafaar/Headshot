import { paymentService } from "@/services/payment"
import { stripeService } from "@/services/payment/stripe.service"
import { appError, NotFoundError } from "@/util/errors"
import { loger } from "@/util/logger"
import { successResponse } from "@/util/response"
import { Request, Response } from "express"

export const getCreditPackages=async (req:Request, res:Response)=>{
    const creditPackages=await paymentService.getCreditPackages()
    return successResponse(res, creditPackages,"Credit packages retrieved successfully")
}

export const processPayment=async(req:Request, res:Response)=>{
    const { packageId, platform, phone, successUrl, cancelUrl}=req.body
    const userId=req.user?.userId
    if(!userId){
      throw new NotFoundError("User not found")
    }
  const paymentResponse=await paymentService.processPayment({cancelUrl,userId ,packageId,platform,successUrl,phone})
  return successResponse(res, paymentResponse,"Payment processed successfully")
}

export const handleStripeWebhook=async(req:Request, res:Response)=>{
 
  const stripeSignature=req.headers["stripe-signature"] 
  if(!stripeSignature){
     throw new appError("Stripe signature is required", 400)
  }

  await stripeService.handleStripeWebhook(req.body, stripeSignature as string)
}

export const getPaymentHistory=async(req:Request, res:Response)=>{
    const userId=req.user?.userId
    if(!userId){
      loger.warn("User not found")
      throw new NotFoundError("User not found")
    }

    const limit=req.query.limit as string || 10
    const orders=await paymentService.getPaymentHistory({userId, limit:Number(limit)})
    return successResponse(res, orders, "Orders were fetched successfully")
}