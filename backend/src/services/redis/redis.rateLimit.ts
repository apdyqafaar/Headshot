import { loger } from "@/util/logger";
import { redisClinet } from "./redis.client";

export interface RateLimitResult{
    allowed:boolean;
    reminding:number;
    resetAt:Date;
}

export class RedisRatelimit{

    // check with increment
    async checkRateLimit(key:string, limit:number, windowsSeconds:number):Promise<RateLimitResult>{
       if(!redisClinet.isConnected()){
        return {
            allowed:true,
            reminding:limit,
            resetAt:new Date(Date.now() + windowsSeconds * 1000)
        }
       }

       try {
        const count= await redisClinet.inCrement(key)
        if(count ===1){
            await redisClinet.expire(key, windowsSeconds)
        }

        const allowed=(count <= limit)
        const reminding=Math.max(0, limit-count)
        const ttl=await redisClinet.ttl(key)
        const resetAt=Date.now() +ttl *1000

        if(!allowed){
            loger.warn(`Rate limit was hit by key:${key}`)
        }

        return{
            allowed,
            reminding,
            resetAt:new Date(resetAt)
        }
       } catch (error) {
         loger.warn(`failed to process rate limit key:${key}`)
          return {
            allowed:true,
            reminding:limit,
            resetAt:new Date(Date.now() + windowsSeconds * 1000)
        }
       }
    }

    // get reset limit
    async resetRateLimi(key:string):Promise<void>{
        if(!redisClinet.isConnected()) return
        try {
            await redisClinet.del(key)
         loger.info(`Rate limit reset for key:${key}`)

        } catch (error) {
         loger.warn(`Error to reset rate limit for the of key:${key}`)
        }
    }

    //  get without increment
     async getRateLimit(key:string, limit:number, windowsSeconds:number):Promise<RateLimitResult>{
       if(!redisClinet.isConnected()){
        return {
            allowed:true,
            reminding:limit,
            resetAt:new Date(Date.now() + windowsSeconds * 1000)
        }
       }

       try {
        const count= await redisClinet.getValues(key)
        const currentCount=count?parseInt(count, 10):0
        const ttl=await redisClinet.ttl(key)
        
        const allowed=(currentCount < limit)
        const reminding=Math.max(0, limit-currentCount)
  
        const resetAt=new Date(Date.now() + windowsSeconds * 1000)

        // if(!allowed){
        //     loger.warn(`Rate limit was hit by key:${key}`)
        // }

        return{
            allowed,
            reminding,
            resetAt
        }
       } catch (error) {
         loger.warn(`failed to process rate limit key:${key}`)
          return {
            allowed:true,
            reminding:limit,
            resetAt:new Date(Date.now() + windowsSeconds * 1000)
        }
       }
    }
}

export const redisRatelimit=new RedisRatelimit()