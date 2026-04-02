import { ratLimitMiddleWare } from "../rateLimit.middleware";

export const authRateLimitConfig={
    login:ratLimitMiddleWare({
        identifierType:"email",
        windowsSeconds:60,
        maxRequests:5,
        keyPrefix:"api:login"
    }),
       register:ratLimitMiddleWare({
        identifierType:"email",
        windowsSeconds:60,
        maxRequests:5,
        keyPrefix:"api:register"
    }),
    
}