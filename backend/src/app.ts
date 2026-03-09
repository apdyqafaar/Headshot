import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors"
import { config } from "./config";
import v1Routes from "./routes/v1"
import { errorMiddleware } from "./middleware/error.middleware";
import { errorResponse, successResponse } from "./util/response";
import { inngestServe } from "./routes/inggest.route";

const app =express();



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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())



// health check
app.get("/health", (req, res)=>{
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