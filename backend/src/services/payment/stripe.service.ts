
import { config } from "@/config";
import { Order } from "@/models";
import { PaymentStatus, StripePaymentResponse } from "@/types/payment-types";
import { appError } from "@/util/errors";
import { loger } from "@/util/logger";
import Stripe from "stripe";
import { log } from "winston";
import { paymentService } from "./payment.service";
export class StripeService{
    private stripe:Stripe

    constructor(){
        const stripeSecretKey=config.stripe.secretKey
        if(!stripeSecretKey){
            loger.error("Stripe secret is not configured")
            throw new Error("Stripe secret is not configured")
        }

        this.stripe= new Stripe(stripeSecretKey,{
            apiVersion:"2026-01-28.clover",
        })
    }

    async createCheckoutSession(params:{
        userId:string;
        packageId:string;
        costumerEmail?:string;
        amount:number;
        successUrl:string;
        credits:number;
        cancelUrl:string;
        metadata?:Record<string, any>
    }):Promise<StripePaymentResponse>{
      try {
        const {amount,cancelUrl,credits,packageId,successUrl,userId,metadata, costumerEmail}=params
        // create session config 
        const sessionConfig:any={
            payment_method_types:["card"],
            mode:"payment",
            line_items:[
                {
                    price_data:{
                        currency:"usd",
                        product_data:{
                            name:`${credits} Headshot credits`,
                            description:`Purchased ${credits} for ${amount}`
                        },
                        unit_amount:Math.round(amount * 100)
                    },
                    quantity:1
                }
            ],
            success_url:successUrl,
            cancel_url:cancelUrl,
            metadata:{
                userId,
                packageId,
                credits:credits.toString(),
                ...metadata
            }
        };

        if(costumerEmail){
            sessionConfig.customer_email=costumerEmail
        }

        // create session
        const session=await this.stripe.checkout.sessions.create(sessionConfig)
        loger.info(`Stripe checkout session created successfully for user ${userId} and package ${packageId}`)
        return{
            status:PaymentStatus.SUCCESS,
            sessionId:session.id,
            redirectUrl:session.url as string || undefined
        
        }
      } catch (error) {
         loger.error("Error creating Stripe checkout session", error)
            throw new appError("Error creating Stripe checkout session", 500)
      }
    }

    async handleStripeWebhook(body:string| Buffer, signature:string):Promise<any>{
            try {
                const webhookSecret=config.stripe.webHook
                if(!webhookSecret){
                    loger.error('Stripe webhook secret is not configured')
                    throw new appError("Stripe webhook secret is not configured", 500)
                }

                const event= await this.stripe.webhooks.constructEventAsync(body, signature,webhookSecret)
                switch (event.type){
                    case "checkout.session.completed":
                        loger.info(`Stripe payment checkout session completed for order ${event.data.object.metadata?.orderId}`)
                            this.handleCheckoutSessionCompleted(event.data.object)
                        break
                    case "payment_intent.payment_failed":
                      loger.error(`Stripe payment intent failed for order ${event.data.object.metadata?.orderId}`)

                      break
                    default:
                          loger.info(`Stripe webhook event was received 
                            eventType=${event.type}
                            eventData=${event.data}
                            }`)

                             break
                }

            } catch (error) {
                loger.error("Error handling stripe webhook: ", error)
                throw new appError("Error handling stripe webhook", 500)
            }
    }

    private async handleCheckoutSessionCompleted(session:any):Promise<void>{
try {
     let order=await Order.findOne({stripeSessionId:session.id})
     if(!order && session.metaData?.orderId){
        loger.info(`Order not found for session stripe  but updating ${session.metaData?.orderI}`)
        order=await Order.findById(session.metaData?.orderId)
     }
     if(!order){
             loger.info(`Order not found for session stripe  ${session.id}`)
             return
     }

//    updating order status to complete with payment details
   if(session.payment_intent && !order.stripePaymentIntentId){
    order.stripePaymentIntentId=session.payment_intent
   }
   if(!order.stripeSessionId){
    order.stripeSessionId=session.id
   }
    await order.save()

    // check payment status if not paid and then update
    if(session.payment_status==="paid" && order.status !==PaymentStatus.COMPLETED ){
  await paymentService.handlePaymentSuccess(order._id.toString(), "STRIPE")
    }

} catch (error) {
    loger.warn(`Failed to process Payment successfully or run the handlePaymentSuccess function`, error)
    throw new appError("Failed to process or complete Payment successfully", 500)
}
    }
}

export const stripeService=new StripeService()