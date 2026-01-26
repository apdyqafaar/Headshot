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
   }
}