
import { config } from "@/config";
import { PaymentStatus, StripePaymentResponse } from "@/types/payment-types";
import { appError } from "@/util/errors";
import { loger } from "@/util/logger";
import Stripe from "stripe";
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
}

export const stripeService=new StripeService()