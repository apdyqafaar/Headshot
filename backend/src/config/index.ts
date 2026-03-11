import dotenv from "dotenv"

dotenv.config()


export const config={
    env:process.env.NODE_ENV ||"development",
    port:process.env.PORT || 8000,

   database:{
    url:process.env.DATABASE_URL ||"mongodb://localhost:27017/headshot"
   },

   frontendUrl:process.env.NODE_ENV==="production"?process.env.FRONTEND_URL :"http://localhost:3000",


// email configuration
   emailConfigs:{
     host:process.env.SMTP_HOST ||"smtp.gmail.com",
     port:parseInt(process.env.SMTP_PORT ||"587",10),
     secure:process.env.SMTP_SECURE || "true",
     user:process.env.SMTP_USER ||"",
     password:process.env.SMTP_PASSWORD ||"",
     from:process.env.EMAIL_FROM ||"example@gmail.com",
   },


   // jwt configs

   jwt:{
      secret:process.env.JWT_SECRET ||"dev-secret",
      expiresIn:process.env.JWT_EXPIRES_IN ||"15m",
      refreshSecret:process.env.JWT_REFRESH_SECRET ||"dev-refresh-secret",
      refreshExpiresIn:process.env.REFRESH_EXPIRES_IN ||"7d",
   },

   // stripe
   stripe:{
      secretKey:process.env.STRIPE_SECRET_KEY,
      webHook:process.env.STRIPE_WEBHOOK_SECRET
   },

   // mobile wallet somalia
   mobileWallet:{
      merchantUid:process.env.MERCHANT_U_ID ||"",
      apiKey:process.env.MERCHANT_API_KEY ||"",
      apiUserId:process.env.MERCHANT_API_USER_ID ||"",
      apiEndpoint:process.env.MERCHANT_API_END_POINT ||""
   },
   // mobile wallet eBIRR
   ebirr:{
      merchantUid:process.env.EBIRR_MERCHANT_U_ID ||"",
      apiKey:process.env.EBIRR_MERCHANT_API_KEY ||"",
      apiUserId:process.env.EBIRR_MERCHANT_API_USER_ID ||"",
      apiEndpoint:process.env.EBIRR_MERCHANT_API_END_POINT ||""
   },

   // aws
   aws:{
      accessKey:process.env.AWS_ACCESS_KEY||"",
      secretKey:process.env.AWS_SECRET_KEY||"",
      bucketName:process.env.AWS_BUCKET_NAME||"",
      region:process.env.AWS_REGION||"",
      version:process.env.AWS_VERSION||"2010-12-01",
   },
   replicate:{
      apiKey:process.env.REPLICATE_API_KEY
   }
}