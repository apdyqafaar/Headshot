import { redisClinet } from "@/services/redis";
import { redisRatelimit } from "@/services/redis/redis.rateLimit";
import { TooManyRequestsError } from "@/util/errors";
import { loger } from "@/util/logger";
import { NextFunction, Request, Response } from "express";
export interface RateLimitConfig{
    maxRequests:number;
    windowsSeconds:number;
    identifierType:"ip"|"email";
    keyPrefix:string;
    message?:string
}

function getIdentifier(req:Request, config:RateLimitConfig):string{
   if(config.identifierType==="email")
{
    const email =(req.body as any)?.email as string

    if(!email){
        // use ip as fall back
        return getClientIp(req)
    }

    return email.toLowerCase().trim()
}
 return getClientIp(req)
}


function getClientIp(req:Request):string{
   const forwarded=req.headers["x-forwarded"]

   if(forwarded){
    const ips=typeof forwarded ==="string"?forwarded.split(","):forwarded
    return ips[0]?.trim() || ""
   }

   return (req.headers["x-real-ip"] as string || req.socket.remoteAddress || "unknown")
}


// format duration in seconds to human readable string
function formatDuration(seconds:number):string{
    if(seconds<60){
        return `${seconds} second${seconds>1?"s":""}`
    }

    const minutes=Math.floor(seconds / 60)
    if(minutes<60){
        return `${minutes} second${minutes>1?"s":""}`

    }
    const hours=Math.floor(minutes/60)
        return `${hours} second${hours>1?"s":""}`

}

// rate limit func:
export function ratLimitMiddleWare(config:RateLimitConfig){
    
    return async(req:Request, res:Response, next:NextFunction)=>{
        try {
            if(!redisClinet.isConnected()){
                loger.warn("Redis was not connected")
                return next()
            }

            const identifier=getIdentifier(req, config)
            const key=`rateLimit:${config.keyPrefix}:${identifier}`

            // check reate kint
            const {allowed,reminding,resetAt}=await redisRatelimit.checkRateLimit(key,config.maxRequests, config.windowsSeconds)

            res.setHeader("X-RateLimit-Limit", config.maxRequests)
            res.setHeader("X-RateLimit-Remaining", reminding)
            res.setHeader("X-RateLimit-Reset", resetAt.toISOString())

            if(!allowed){
                loger.warn(`Rate limit exceeded for key: ${redisClinet}`)
                 throw new TooManyRequestsError(config.message||"Rate limit exceeded ")
            }

            return next()
        } catch (error) {
             return next(error)
        }
    }
}