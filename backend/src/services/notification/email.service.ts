import { config } from "@/config"
import { ExternalServiceError } from "@/util/errors"
import { loger } from "@/util/logger"
import nodemailer from"nodemailer"
import path from "path"
import fs from "fs/promises"
import { templateEngine } from "@/util/templateEngine"

export class EmailService{
    private transport:nodemailer.Transporter | null=null

    constructor(){
        this.initializeTransporter()
    }

    private initializeTransporter():void{
         
        if(config.emailConfigs.user && config.emailConfigs.password){
            try {
                this.transport= nodemailer.createTransport({
                    host:config.emailConfigs.host,
                    port:config.emailConfigs.port,
                    secure:config.emailConfigs.secure==="true",
                    auth:{
                        user:config.emailConfigs.user,
                        pass:config.emailConfigs.password
                    },
                    debug:config.env==="development",
                    logger:config.env==="development",
                })


                // verify connection

                 this.transport.verify((error, success)=>{
                   if(error){
                    loger.error("SMPT connection failed",{
                        error:error.message,
                        code:(error as any).code
                    })
                    loger.info("SMPT connection failed")
                   }else{
                    loger.info("SMPT connection established")
                   }
                })

            } catch (error) {
                loger.warn("SMPT connection failed",error)
                throw new Error("Error initializing SMPT transporter")
            }
        }else{
            loger.error("SMPT credentials is not configured",{
                hasUser:!!config.emailConfigs.user,
                hasPassword:!!config.emailConfigs.password,
            })
        }
    }

    // ensure transporter is configured
    private ensureTransporter():void{
        if(!this.transport){
            loger.warn('SMTP transporter is not initialized')
           throw new ExternalServiceError('Email service: SMTP transporter is not initialized')
        }
    }

    // wrap email content in base layout
    private async wrapInlayout(content:string):Promise<string>{
     const layoutPath=path.join(process.cwd(), "src/templates/emails/layout/base.html")
     const layout=await fs.readFile(layoutPath, 'utf-8')
     return layout.replace("{{content}", content)
    }


    // sender email
    private async senderEmail(to:string, subject:string, templateName:string, data:Record<string, any>):Promise<void>{
        this.ensureTransporter()
        loger.info("Sending Email is ready: ",{
            to,
            subject,
            data, templateName
        })

        // render HTML and TEXT templates
        const htmlContent=await templateEngine.renderHTML(templateName,data)
        const html= await this.wrapInlayout(htmlContent)
        const text=await templateEngine.renderTEXT(templateName,data)

        loger.info(`Rendering HTML template for ${templateName}`, {
            html,
            text
        })
        const mailOptions={
            from:`"Headshot Generator" <${config.emailConfigs.from}>`,
            subject,
            to, 
            text,
            html
        }

        
        loger.info(`Sending email with Options ${mailOptions}`)

        try {
            const resultEmail=await this.transport!.sendMail(mailOptions)
            loger.info("Email sent successfully", {
                resultEmail
            })

            // some times email can be rejected to send 
            if(resultEmail.rejected && resultEmail.rejected.length>0){
                loger.warn("Email rejected",{
                    to, templateName,
                    rejected:resultEmail.rejected,
                    response:resultEmail.response
                })
            }
        } catch (error:any) {
            loger.error("Failed to send Email",{
                to ,
                subject,
                template:templateName,
                error:error.message,
                code:error.code,
                command:error.command,
                response:error.response,
                responseCode:error.responseCode,
                stack:error.stack
            })
            throw new ExternalServiceError("Failed to send Email")
        }


    }


    async sendVerificationEmail(email:string, name:string|undefined, token:string):Promise<void>{
        const verificationUrl=`${config.frontendUrl}/auth/verify-email?token=${token}`
        await this.senderEmail(email, "Verify Your Email Address", "verification", {
            name:name||"",
            verificationUrl
        })
    }
}


export const emailService= new EmailService()