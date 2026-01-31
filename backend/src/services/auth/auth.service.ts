import { IUser, User } from "@/models/User.model"
import { registerInput } from "@/validaors/auth.validator"
import { passwordService } from "./methods/pasword.service"
import { verificationService } from "./methods/verification.service"
import { ConflictError, ExternalServiceError, validationErrors } from "@/util/errors"
import { emailService } from "../notification/email.service"
import { loger } from "@/util/logger"

export class AuthService{

    async registerUser(input:registerInput):Promise<{user:IUser}>{
       
        // normalize email to lowercase
        const normalizedEmail=this.normalizeEmail(input.email)
         await this.checkUserExists(normalizedEmail)

        // hashing password first
        const hashedPassword= await passwordService.hashPassword(input.password)

        // generate verification token
        const verificationToken= verificationService.generateVerificationToken()
        const verificationExpires= verificationService.generateExpirationDate()

        // create user
        const user=await User.create({
            email:normalizedEmail,
            password:hashedPassword,
            name:input.name || "",
            emailVerification:verificationToken,
            emailVerificationExpires:verificationExpires,
            isEmailVerified:false
        })

        // TODO: send verification email
        try {
          await emailService.sendVerificationEmail(normalizedEmail, input.name, verificationToken)  
        } catch (error) {
           loger.error("Error sending verification email", error)
           throw new ExternalServiceError("Email Service Failed to work") 
        }
        

        return {
            user
        }


    };


    // verification email
    async verifyEmail(token:string):Promise<void>{
     const user=await User.findOne({
      emailVerification:token
     }).select("+emailVerificationExpires +emailVerification")

     if(!user){
      throw new validationErrors("Invalid verification token")
     }

    //  check if user already verified
    if(user?.isEmailVerified){
      throw new ConflictError("Email already verified")
    }

    //  check if token expired
    if(!user.emailVerificationExpires || new Date() > user?.emailVerificationExpires){
       throw new validationErrors("Verification token has expired")
    }
    // verifying email
   

    }

    private async checkUserExists(email:string):Promise<void>{
      const existingUser=await User.findOne({email})
      if(existingUser){
        throw new ConflictError(`User already exists with this email ${email}`)
      }
    };

    private normalizeEmail(email:string):string{
        return email.toLocaleLowerCase().trim()
    }
}

export const authService=new AuthService()