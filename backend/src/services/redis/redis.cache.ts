import { loger } from "@/util/logger";
import { redisClinet } from "./redis.client";

class RedisCacheService{

    // set cache
async set<T>(key:string, value:T, ttl:number):Promise<void>{
if(!redisClinet.isConnected())return

try {
    const serializedValue=JSON.stringify(value)
    await redisClinet.setex({key, seconds:ttl, value:serializedValue})
} catch (error) {
    loger.warn(`Failed to set cache `, error)
}
}


// get cache
async get<T>(key:string):Promise<T|null>{
    //  if(redisClinet.isConnected())return null

    try {
     const value=await redisClinet.getValues(key)
     return JSON.parse(JSON.stringify(value))
} catch (error) {
    loger.warn(`Failed to get cache `, error)
    return null
}
}

// delete cache
async delete<T>(key:string):Promise<void>{
     if(redisClinet.isConnected())return 

    try {
     await redisClinet.del(key)
} catch (error) {
    loger.warn(`Failed to delete cache `, error)
}
}

// clear all cache using pattern
async deletePattern(pattern:string):Promise<void>{
    if(!redisClinet.isConnected())return

    try {
        const rowClient=redisClinet.getClient()
        if(!rowClient)return

        let  keys:string[]=[]
        let cursor=0

        do {
            const result=await rowClient.scan(cursor,{match:pattern, count:100})

            if(Array.isArray(result) && result.length>=2){
                const cursorValue=result[0]
                const foundKeys=result[1]

                cursor=typeof cursorValue==="number"?cursorValue:parseInt(String(cursorValue),10)

                // collect all found keys
                if(Array.isArray(keys)){
                    keys.push(...foundKeys)
                }else{
                    break
                }
            }
        } while (cursor!==0);


        if(keys.length>0){
            await Promise.all((keys).map(async(k)=> await redisClinet.del(k)))
        }
    } catch (error) {
    loger.warn(`Failed to delete pattern cache `, error)
        
    }
}
}
export const redisCacheService=new RedisCacheService()