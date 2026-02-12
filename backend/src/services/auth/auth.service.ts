import { IUser, User, UserRole } from "@/models/User.model"
import { registerInput } from "@/validaors/auth.validator"
import { passwordService } from "./methods/pasword.service"
import { verificationService } from "./methods/verification.service"
import { ConflictError, ExternalServiceError, NotFoundError, UnauthorizedError, validationErrors } from "@/util/errors"
import { emailService } from "../notification/email.service"
import { loger } from "@/util/logger"
import { TokenPayload, tokenService } from "./token.service"

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
            isEmailVerified:false,
            role:UserRole.USER
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
    user.isEmailVerified=true
    user.emailVerification=undefined
    user.emailVerificationExpires=undefined

    await user.save()

    }

    // resend email verification token
     async resendEmailVerification(email:string):Promise<void>{
         const normalizedEmail=this.normalizeEmail(email)
         const user=await User.findOne({email:normalizedEmail})
         if(!user){
          throw new NotFoundError("User not found")
         }

         if(user.isEmailVerified){
          throw new ConflictError("Email is already verified")
         }

        //  generating new verification
        const verificationToken=verificationService.generateVerificationToken()
        
        const verificationTokenExpires=verificationService.generateExpirationDate()

        user.emailVerification=verificationToken
        user.emailVerificationExpires=verificationTokenExpires
        await user.save()

        try {
          await emailService.sendVerificationEmail(normalizedEmail,user.name||"", verificationToken)
        } catch (error) {
          loger.error("Failed to resend email verification token", error)
          throw new ExternalServiceError("Email service failed to resend verification token")
        }
     }

    //  login user
    async login(email:string, password:string):Promise<{user:IUser, accessToken:string, refreshToken:string}>{
      // normalizing meial
      const normalizedEmail=this.normalizeEmail(email)

      // checking if this email exists
      const user=await User.findOne({email:normalizedEmail}).select("+password")

      if(!user) {
        throw new NotFoundError("User not found")
      }

      // is active the user
      if(!user.isActive){
         throw new UnauthorizedError("User is not active")
      }

      // is email verified
      if(!user.isEmailVerified){
         throw new UnauthorizedError("Email is not verified")
      }


      // compare
      const isPasswordValid=await passwordService.varifyPassword({password:password, hash:user.password})
      if(!isPasswordValid){
        throw new UnauthorizedError("Invalid email or password")
      }

      // generate token access `this is the fun part huhh`
       const tokenPayload:TokenPayload={
        userId:user._id.toString(),
        email:normalizedEmail,
        role:user.role
       }
       const {accessToken, refreshToken}=tokenService.generateTokenPair(tokenPayload)
       user.refreshToken=refreshToken
       await user.save()

       return {
        user, 
        accessToken,
        refreshToken
       }

    }

    // get current user service
    async getCurrentUser(userId:string):Promise<IUser>{
      const user=await User.findById(userId)
        if(!user){
          throw new NotFoundError("User not found")
        }

        return user
    }

    // refresh token service
    async refreshAccessToken(refreshToken:string):Promise<{accessToken:string, refreshToken:string}>{

      // verify first the refresh token
      const payload= tokenService.verifyRefreshToken(refreshToken)
      const user=await User.findById(payload.userId).select("+refreshToken")
      if(!user || user.refreshToken !==refreshToken){
        throw new UnauthorizedError('Invalid refresh token')
      }

      // is active
      if(!user.isActive){
        throw new UnauthorizedError("Your account has ben deactivated, Please contact support.")
      }

      // generating new access token
      const newPayload:TokenPayload={
        email:user.email,
        userId:user._id.toString(),
        role:user.role
      }
      const tokens=tokenService.generateTokenPair(newPayload)
      user.refreshToken=tokens?.refreshToken
      await user.save()
      return tokens

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