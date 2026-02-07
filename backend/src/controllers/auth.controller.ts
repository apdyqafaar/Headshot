import { authService } from "@/services"
import { validationErrors } from "@/util/errors"
import { createdResponse, successResponse } from "@/util/response"
import type { Request, Response } from "express"

export const register=async(req:Request, res:Response)=>{

    const {user}= await authService.registerUser(req.body)
 
     return createdResponse(res, "User registered successfully", {user:{
        id:user._id,
        email:user.email,
        name:user.name,
        isEmailVerified:user.isEmailVerified
     }})


}

export const verifyEmail=async(req:Request, res:Response)=>{
  const {token}=req.query

  if(!token || typeof token !== "string"){
   throw new validationErrors("verification token is required")
  }

//   verification service
await authService.verifyEmail(token)

return successResponse(res,{message:"Email was verified successfully"}, "Email was verified successfully")
}

// resend verification email
export const resendVerificationEmail= async(req:Request, res:Response)=>{
       const {email}=req.body
       if(!email){
        throw new validationErrors("Email is required")
       }


      //  resend service
      await authService.resendEmailVerification(email)
      return successResponse(res, {message:"Verification email sent successfully"}, 'Verification email sent successfully')
}