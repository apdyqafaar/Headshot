import { ratLimitMiddleWare } from "../rateLimit.middleware";

export const apiRateLimitConfig={
   
    general:ratLimitMiddleWare({
        identifierType:"ip",
        windowsSeconds:60,
        maxRequests:10,
        keyPrefix:"api:general"
    }),
    
}
