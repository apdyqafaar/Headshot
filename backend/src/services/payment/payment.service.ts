import { CreditsPackage, ICreditPackage, IOrder, Order, User } from "@/models";
import { MobileWalletPayload, MobileWalletResponse, PaymentPlatform, PaymentResponse, PaymentStatus } from "@/types/payment-types";
import { appError, NotFoundError } from "@/util/errors";
import { loger } from "@/util/logger";
import { stripeService } from "./stripe.service";
import { triggerCreditAddition } from "../queue/queue.service";
import { config } from "@/config";
import axios from "axios";

export class PaymentService{
    // TODO: implement payment service
//  private stripeService:StripeService

//   get all credit packages
 async getCreditPackages():Promise<ICreditPackage[]|null>{
        try {
            const creditPackages=await CreditsPackage.find({isActive:true})
            return creditPackages
        } catch (error) {
            loger.error("Failed to get credit packages", error)
            throw new appError("Failed to get credit packages")
        }
 }

//  get single creditPackage
async getCreditPackageById(id:string):Promise<ICreditPackage|null>{
     try {
        const creditPackage=await CreditsPackage.findById(id)
        if(!creditPackage){
            throw new NotFoundError("Credit package not found")
        }
        return creditPackage
     } catch (error) {
        loger.error("Failed to get credit package by id", error)
        throw new appError("Failed to get credit package by id")
     }
}

// create order
async createOder(params:{
    userId:string,
    packageId:string,
    platform:PaymentPlatform,
    phone?:string,
    credits:number
    amount:number
}):Promise<IOrder>{
  try {
      const {packageId,platform,userId,phone, credits,amount}=params

      const order=await Order.create({
        user:userId,
       package:packageId,
       platform,
       phone,
        credits,
        amount,
        status:PaymentStatus.PENDING
      }) 

      return order
  } catch (error) {
    loger.error("Failed to create order", error)
    throw new appError("Failed to create order")
  }
}
// process stripe payment response
async processStripePayment(params:{
    order:IOrder,
    creditPackage:ICreditPackage,
    successUrl:string,
    cancelUrl:string,
    totalCredits:number,
    userEmail?:string
}):Promise<PaymentResponse>{
    try {
        const {cancelUrl,creditPackage,order, successUrl,totalCredits,userEmail}=params
    // create stripe check out
    const stripeSession=await stripeService.createCheckoutSession({
        userId:order.user.toString(),
        packageId:order.package.toString(),
        amount:creditPackage.price,
        credits:totalCredits,
        costumerEmail:userEmail,
        successUrl,
        cancelUrl,
        metadata:{
            orderId:order._id.toString(),
            packageName:creditPackage.name
        }
    })

    order.stripeSessionId=stripeSession.sessionId
    order.status=PaymentStatus.PROCESSING
    await order.save()

    loger.info(`Stripe checkout session was created successfully for order ${order._id.toString()}`)

    return{
        success:true,
        message:"Payment session created successfully",
        orderId:order._id.toString(),
        sessionId:stripeSession.sessionId,
        redirectUrl:stripeSession.redirectUrl,
        // redirectUrl:`${config.frontendUrl}/verify-payment?session_id=${stripeSession.redirectUrl}`,
        amount:order.amount,
        credits:totalCredits,
        status:PaymentStatus.PROCESSING
    }
    } catch (error:any) {
        const errorMessage=error instanceof appError
        ?error.message
        :error?.message || error?.type || String(error)||"UNKNOWN"

        loger.error("Error processing Stripe payment",{
            error:errorMessage,
            stack:error.stack,
            orderId:params.order._id,
            stripeError:error?.type  || error?.code,
            fullError:error
        })
        throw new appError(
            `Failed to process Stripe payment: ${errorMessage}`, 500,`PROCESS_STRIPE_PAYMENT_ERROR`
        )
    }
    
}

// process mobile wallet payment (SAHAL, EVC, ZAAD)
async processMobileWalletPayment(params:{
    order:IOrder,
    platform:PaymentPlatform,
    phone:string
}):Promise<PaymentResponse>{
   
    const {order,phone,platform}=params
   
    try {
    
      if(!phone){
        throw new appError("Phone number is required", 400)
      }
      loger.info(`Processing mobile wallet payment for order ${order._id.toString()} on platform ${platform} with phone ${phone}`)
      const config=this.getMobileWalletConfig(platform)
      if(!config.apiEndpoint || !config.apiKey || !config.apiUserId  || !config.merchantUid ){
        loger.warn(`Mobile wallet config is not valid for platform ${platform}`)
        throw new appError("Mobile wallet config is not valid", 400)
      }

    //   preparing the payload
      const payload:MobileWalletPayload={
        schemaVersion:"1.0",
        requestId:order._id.toString()+"-"+Date.now(),
        timestamp:new Date().toISOString(),
        channelName:"WEB",
        serviceName:"API_PURCHASE",
        serviceParams:{
            merchantUid:config.merchantUid,
            apiKey:config.apiKey,
            apiUserId:config.apiUserId,
            paymentMethod:"MWALLET_ACCOUNT",
            payerInfo:{
                accountNo:phone
            },
            transactionInfo:{ 
                   platform,
                 amount:order.amount,
                 currency:"USD",
                 description:`Headshot Pro - Purchase of ${order.credits} credits`,
                 invoiceId:order._id.toString(),
                referenceId:order._id.toString(),
            }

        }

       }
       loger.info(`sending mobile wallet payment request for order ${order._id.toString()} with payload`, payload)
       const response=await axios.post<MobileWalletResponse>(config.apiEndpoint, payload,{
        headers:{
            "Content-Type":"application/json"
        }
       })
         loger.info(`Received response from mobile wallet payment request for order ${order._id.toString()} on platform ${platform}`, response.data)
         return await this.handleMobileWalletResponse(response.data, order, platform)

    } catch (error) {
        loger.error(`Error processing mobile wallet payment for order ${order._id.toString()} on platform ${platform}`, error)
        throw new appError("Failed to process mobile wallet payment", 500)
    }
}
// get mobile config
getMobileWalletConfig(platform:PaymentPlatform):{
    merchantUid:string,
    apiKey:string,
    apiUserId:string,
    apiEndpoint:string
}{

    switch(platform){
        case PaymentPlatform.EBIRR:
            return{
                merchantUid:config.ebirr.merchantUid,
                apiKey:config.ebirr.apiKey,
                apiUserId:config.ebirr.apiUserId,
                apiEndpoint:config.ebirr.apiEndpoint,
            }
        default:
             return{
                merchantUid:config.mobileWallet.merchantUid,
                apiKey:config.mobileWallet.apiKey,
                apiUserId:config.mobileWallet.apiUserId,
                apiEndpoint:config.mobileWallet.apiEndpoint,
            }
    }
}

// handle mobile wallet response
async handleMobileWalletResponse(response:MobileWalletResponse, order:IOrder, platform:PaymentPlatform):Promise<PaymentResponse>{
 try {
     const isSuccess=response.responseCode==="2001" ||response.referenceId==="RCS_SUCCESS"
  if(isSuccess){
    order.status===PaymentStatus.PROCESSING,
    order.transactionId=response.transactionId ||response.referenceId;
    await order.save()
    // Que credit addition
    await this.handlePaymentSuccess(order._id.toString(), "LOCAL")
    loger.info(`Mobile wallet payment processed successfully for order ${order._id.toString()} on platform ${platform}`)

    return {
        success:true,
        message:'Mobile wallet payment processed successfully',
        orderId:order._id.toString(),
        transactionId:order.transactionId ,
        amount:order.amount,
        credits:order.credits,
        status:PaymentStatus.COMPLETED
    }
  }else{
    order.status=PaymentStatus.FAILED
    await order.save()
    loger.warn(`Mobile wallet payment failed for order ${order._id.toString()} on platform ${platform} with response`, response)
    return{
        success:false,
        message:'Mobile wallet payment failed',
        orderId:order._id.toString(),
        amount:order.amount,
        credits:order.credits,
        status:PaymentStatus.FAILED,
        error:{
            code:response.responseCode,
            message:response.responseMSG,
            fullResponse:response
        }
    }
  }
 } catch (error) {
   loger.info(`Error handling mobile wallet response for order ${order._id.toString()} on platform ${platform}`, )
    throw new appError("Failed to handle mobile wallet response", 500)
 }
}

// process payment
async processPayment(params:{
    userId:string,
    packageId:string,
    platform:PaymentPlatform,
    phone?:string,
    successUrl:string,
    cancelUrl:string,
}):Promise<PaymentResponse>{
   try {
      
    const {cancelUrl,packageId,platform,successUrl,userId,phone}=params
    // get creditPackage
    const creditPackage=await this.getCreditPackageById(packageId)
      if(!creditPackage){
            throw new NotFoundError("Credit package not found")
      }

    // calculating
    const totalCredits=creditPackage?.credits + (creditPackage?.bonus ||0)

    // get user from data base
    const user=await User.findById(userId)
    let userEmail=user?.email

    // creating order
    const order=await this.createOder({userId, packageId, amount:creditPackage.price, credits:totalCredits, phone, platform})

    // process payment platform
    if(platform===PaymentPlatform.STRIPE){
      return await this.processStripePayment({
        cancelUrl,
        creditPackage,
        order,
        successUrl,
        totalCredits,
        userEmail
      })
    }else if(platform===PaymentPlatform.LOCAL){
        // TODO: process local payment by admin
        return{
        success:true,
        message:'payment session created',
        orderId:"",
        redirectUrl:"",
        amount:order.amount,
        credits:totalCredits
      }
    }else if(platform===PaymentPlatform.EBIRR){
  return{
        success:true,
        message:'payment session created',
        orderId:undefined,
        redirectUrl:undefined,
        amount:order.amount,
        credits:totalCredits
      }
    }else if(platform===PaymentPlatform.EVC ||platform===PaymentPlatform.ZAAD ||platform===PaymentPlatform.SAHAL){
        if(!phone){
            throw new appError("Phone number is required for mobile wallet payment", 400)
        }
         return await this.processMobileWalletPayment({
            order,
            platform,
            phone:phone as string
         })
    }else {
        throw new appError("unsupported  platform", 400)
    }

   } catch (error) {
    loger.error("Failed to process payment", error)
    throw new appError("Failed to process payment")
   }
}

// process payment if success
   async handlePaymentSuccess(orderId:string, source:"STRIPE"|"LOCAL"|"ADMIN"="STRIPE"):Promise<void>{

    try {
        const order=await Order.findById(orderId)
       if(!order){
        loger.warn("Order not found",orderId)
        throw new appError("Order not found", 404)
       }

       if(order.creditsAdded){
          loger.warn("Credits already added for order", orderId)
          throw new appError("Credits already added for order")
       }

    //  : Integrating Inngest Queue for the payment
             await triggerCreditAddition({
                credits:order.credits as number,
                userId:order.user.toString(),
                orderId:order._id.toString(),
                source,
             })
             loger.info(`Credits addition triggred for order ${order._id} with ${order.credits} credits from ${source}`)
    } catch (error) {
        loger.info(`Credits addition triggred for order `, error)
    }

       

   }
}

export const paymentService=new PaymentService()