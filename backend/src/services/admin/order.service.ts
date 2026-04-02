import { CreditsPackage, IOrder, Order, User } from "@/models";
import { PaymentPlatform, PaymentStatus } from "@/types/payment-types";
import { appError, NotFoundError } from "@/util/errors";
import { loger } from "@/util/logger";
import { redisCacheService } from "../redis";

interface OrderResponse{
    orders:IOrder[],
    pagination:{
        limit:number,
        page:number,
        pages:number,
        total:number,
    }
}

export class OrderServices{
    private readonly CACHE_TTL=60 * 5

    // get keys for caching
    private getOrderCacheKey(params:{limit:number, page:number, status:string, platform:string}):string{
        const {limit, page, status, platform}=params
         const parts=["orders:admin"]
         if(status)parts.push(`limit:${status}`)
         if(limit)parts.push(`limit:${limit}`)
         if(platform)parts.push(`limit:${platform}`)
         if(page)parts.push(`limit:${page}`)

            return parts.join(':').toLowerCase()
    }

     async invalidateOrdersCache():Promise<boolean>{
        try {
            await redisCacheService.deletePattern("orders:admin:*")
            loger.info("Invalidated orders cache")
            return true
        } catch (error) {
             loger.warn("Failed to Invalidated orders cache")
            return false
        }
    }

    async getAllOrders(params:{limit:number, page:number, status:string, platform:string}):Promise<OrderResponse>{
       
        
        try {
          const {limit,page, status, platform, }=params  
              const cacheKey=this.getOrderCacheKey(params)
              const cacheData=await redisCacheService.get<OrderResponse>(cacheKey)
              if(cacheData){
          
                return cacheData
              }
          let query:any={}
          if(status)query.status=status
          if(platform)query.platform=platform
          const skip= (page -1) * limit

          const [orders, total]=await Promise.all([
            await Order.find(query)
            .populate("user", "name email")
            .populate("package")
            .sort({createdAt:-1})
            .skip(skip)
            .limit(limit),
            await Order.countDocuments(query)
          ])
             const result={
            orders,
            pagination:{
                total,
                page,
                limit,
                pages:Math.ceil(total/limit)
            }
          }
        //   set here cache
          await redisCacheService.set(cacheKey,result,this.CACHE_TTL)
       
       return result
        } catch (error) {
            loger.warn("Error occurred while fetching all orders", {error})
            throw new appError("Failed to fetch orders")
        }
    }

    async createManualOrder(data:{userId:string,amount:number, packageId:string}):Promise<IOrder>{
       
       try {
        const {amount, packageId, userId}=data

        const user=await User.findById(userId)
        if(!user){
            throw new NotFoundError("User not found")
        }

          const creditsPackage=await CreditsPackage.findById(packageId)
        if(!creditsPackage){
            throw new NotFoundError("package not found")
        }

    


        const order=await Order.create({
            user:userId,
            amount,
            package:creditsPackage._id,
            platform:PaymentPlatform.LOCAL,
            phone:"ADMIN",
            status:PaymentStatus.COMPLETED,
            transactionId:`MANUAL-${Date.now()}`,
            credits:creditsPackage.credits +(creditsPackage.bonus ||0),
            creditsAdded:true
        })
        await User.findByIdAndUpdate(userId, {$inc:{credits:order.credits,}})
            await this.invalidateOrdersCache()
        return order
       } catch (error) {
          loger.warn("Error occurred while creating order manual", {error})
            throw new appError("Failed to creating order manual")
       }
    }
}

export const orderServices=new OrderServices()