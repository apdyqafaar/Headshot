import { CreditsPackage, ICreditPackage, IOrder, Order, User } from "@/models";
import { PaymentPlatform, PaymentResponse, PaymentStatus } from "@/types/payment-types";
import { appError, NotFoundError } from "@/util/errors";
import { loger } from "@/util/logger";
import { stripeService } from "./stripe.service";

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
         return{
        success:true,
        message:'payment session created',
        orderId:"",
        redirectUrl:"",
        amount:order.amount,
        credits:totalCredits
      }
    }else {
        throw new appError("unsupported  platform", 400)
    }

   } catch (error) {
    loger.error("Failed to process payment", error)
    throw new appError("Failed to process payment")
   }
}
}

export const paymentService=new PaymentService()