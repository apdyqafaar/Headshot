import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors"
import { config } from "./config";
import v1Routes from "./routes/v1"
import { errorMiddleware } from "./middleware/error.middleware";
import { errorResponse, successResponse } from "./util/response";
import { inngestServe } from "./routes/inggest.route";
import { apiRateLimitConfig } from "./middleware/rateLimit";
import helmet from "helmet";
import compression from 'compression'

const app =express();

app.use(helmet({
    contentSecurityPolicy:{
        directives:{
            defaultSrc:["'self'"],
            styleSrc:["'self'", "'unsafe-inline'"],
            scriptSrc:["'self'"],
            imageSrc:["'self'", "data:", "https:"],
            // connectSrc:[
            //     "'self'",
            //     "https://api.stripe.com",
            //     "https://replicate.com",
            //     config.env==="development"?"http://localhost:3000":config.frontendUrl
            // ]
            fontSrc:["'self'", "data:"],
            frameSrc:["'self'"],
            objectSrc:["'none'"],
            upgradeInsecureRequests:[]
        },
    },
    crossOriginEmbedderPolicy:false,
    crossOriginResourcePolicy:{policy:"cross-origin"}
}))

app.use(compression())
// cors and origins
app.use(cors({
    origin:config.frontendUrl,
    credentials:true,
    methods:["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders:["Content-Type","Authorization", "Cookie", "stripe-signature"]
}))

// stripe webhook needs raw body, so we need to use express.raw for that route
app.use("/api/v1/payment/webhook/stripe", express.raw({ type: "application/json" }), async(req, res, next) => {
      try {
       const {handleStripeWebhook}=await import("./controllers/payment.controller")
       await handleStripeWebhook(req, res)
      } catch (error) {
        next(error)
      }
});

// middleware
app.use(express.json({limit:"10mb"}));
app.use(express.urlencoded({ extended: true, limit:"10mb" }));
app.use(cookieParser())



// health check
app.get("/health",apiRateLimitConfig.general, (req, res, next)=>{
    return successResponse(res, { status:"ok",
            message:"server is working healthily...",
            timeStamp:new Date().toISOString()},
            "server is working healthily...",
        )
})


//TODO: routes
app.use("/api/v1/", v1Routes);
// inggest
app.use("/api/inngest", inngestServe)

//  404 Route
app.use((req, res)=>{
    return errorResponse(res, "Route not found",404,[{path:req.originalUrl, message:"Route not found"}])
})
// TODO: ERROR handling
app.use(errorMiddleware)





export default app