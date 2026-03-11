import { Order, User } from "@/models"
import { inngestClient } from "@/routes/inggest.route"
import { emailService } from "@/services/notification/email.service"
import { PaymentStatus } from "@/types/payment-types"
import { loger } from "@/util/logger"
import { NonRetriableError } from "inngest"

export interface ICreditAdditionData{
     userId:string,
    orderId:string,
    credits:number,
    source:"STRIPE"|"LOCAL"|"ADMIN"
}

export function getCreditAdditionFunction(){
    return inngestClient.createFunction(
        {id:"payment-add-credits", name:"Payment Add Credits", retries:3},
        {
            event:"payment/credits-add"
        },
        async ({event, step})=>{
            const {credits,orderId,source,userId}=event.data as ICreditAdditionData
            loger.info(`Credits addition triggered for order ${orderId} with ${credits} credits from source of ${source}`)

            // step 1 get the order
            const order=await step.run("validate-order", async()=>{
                const foundOrder=await Order.findById(orderId)
                if(!foundOrder){
                    loger.warn(`Order not found for order id: ${orderId}`)
                    throw new NonRetriableError("Order not found")
                }
                if(foundOrder.creditsAdded){
                   loger.warn(`Credits already added for order id: ${orderId}`)
                   return{alreadyProcessed:true, order:foundOrder}
                }

                return{alreadyProcessed:false, order:foundOrder}
            })

            if(order.alreadyProcessed){
                    loger.warn(`Credits already added for order id: ${orderId}`)
                    return{success:true, message:"Credits already added for order ", skipped:false}
            }

            // step 2 add the credits to the user
            const result=await step.run("add-credits",async()=>{
                // find the user
                const user=await User.findById(userId)
                 if(!user){
                    loger.warn(`user not found for user id: ${userId}`)
                    throw new NonRetriableError("user not found")
                }

                 const updatedOrder=await Order.findById(orderId)
                if(!updatedOrder){
                    loger.warn(`Order not found for order id: ${orderId}`)
                    throw new NonRetriableError("Order not found")
                }
            


                // previous balance
                let previousBalance=user.credits
                user.credits=user.credits +credits
                await user.save()

                // mark the order credits added and complete
                  updatedOrder.creditsAdded=true
                  updatedOrder.status=PaymentStatus.COMPLETED
                 await updatedOrder.save()

                loger.info(`Credits added for order ${orderId} with ${credits} credits  from ${source}`)
                return{
                    success:true,
                    previousBalance,
                    newBalance:user.credits,
                    creditsAdded:credits,
                    skipped:false,
                    userEmail:user.email,
                    orderAmount:updatedOrder.amount,
                    name:user.name,
                    orderId:updatedOrder._id.toString()
                }
            })

            // step 3 send email notification to the user
            await step.run("send-notification", async()=>{
                try {
                     // send the email
                if(result.userEmail && result.orderAmount !== undefined){
                    await emailService.sendPaymentSuccessEmail(result.userEmail, result.name, result.orderId,result.orderAmount, result.creditsAdded, result.newBalance)
                    loger.info(`User email or order amount was sent for ${result.orderId} to ${result.userEmail} `)
                }else{
                     loger.info(`User email or order amount was not found  ${result.userEmail} `)
                     throw new NonRetriableError("User email or order amount was not found ")
                } 
                } catch (error) {
                     loger.info(`Failed to send email  ${result.userEmail} `)
                     throw new NonRetriableError("Failed to send email")
                }
              
                return {notification:true}
            })


            return{
                success:true,
                message:"Credits added for order",
                skipped:false,
                notificationSent:true,
                data:result
            }
        }
    )
}