import { config } from "@/config"
import { appError } from "@/util/errors"
import { loger } from "@/util/logger"
import { Redis } from "@upstash/redis"

class RedisClient{
    private client: Redis | null =null
    private isEnabled:boolean =false

    constructor(){
        this.initializeClient()
    }

    private initializeClient():void{
        const {token,url}=config.upstash
        if(!token ||!url){
            loger.warn('Redis configuration is not set or might be empty!')
            return
        }
        try {
            this.client=new Redis({
            url,
            token
        })
        this.isEnabled=true
            loger.info('Redis client has been initialized successfully')

        } catch (error) {
            loger.warn('Error initializing Redis client')
            this.isEnabled=false
            throw new appError('Error initializing Redis client')
        }
    }

    // check is it fi connected func:
    public isConnected(){
        return this.isEnabled
    }
    // get client
    public getClient():Redis |null{
        return this.client
    }

    // set value with expiration
    async setex({key, seconds, value}:{key:string, seconds:number, value:string}):Promise<void>{
      if(!this.isConnected()){
        throw new appError("This client is nor connected")
      }
      try {
         await this.client?.setex(key,seconds, value)
      } catch (error) {
            loger.warn('Error with setting value with time expiration')
        throw new appError("Error with setting value with time expiration")
        
      }
    }

     // get values
    async getValues(key:string):Promise<string |null>{
      if(!this.isConnected()) return null
      
      try {
        return await this.client!.get(key) ?? null
      } catch (error) {
            loger.warn('Error with getting values from upstash')
        return null
        
      }
    }


      // delete values
    async del(key:string):Promise<void>{
        if(!this.isConnected()){
        throw new appError("This client is nor connected")
      }
      try {
         await this.client!.del(key) 
      } catch (error) {
            loger.warn('Error with deleting value')
    
             throw new appError("Error with deleting value")
      }
    }

     // increment counter
    async inCrement(key:string):Promise<number>{
        if(!this.isConnected())return 0 
      try {
        return await this.client!.incr(key) 
      } catch (error) {
            loger.warn('Error with incrementing counter')
    
             throw new appError("Error with incrementing counter")
      }
    }

       // set expiration time
    async expire(key:string, seconds:number):Promise<void>{
        if(!this.isConnected())return 
      try {
         await this.client!.expire(key, seconds) 
      } catch (error) {
            loger.warn('Error with setting expiration time')
    
             throw new appError("Error with setting expiration time")
      }
    }

       // get Time to live (TTL)
    async ttl(key:string, ):Promise<number>{
        if(!this.isConnected())return 0
      try {
         return await this.client!.ttl(key)
      } catch (error) {
            loger.warn('Error getting time to live')
    
             throw new appError("Error getting time to live")
      }
    }
}


export const redisClinet=new RedisClient()