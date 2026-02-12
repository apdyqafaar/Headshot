import { config } from "@/config"
import { authService } from "@/services"
import { UnauthorizedError, validationErrors } from "@/util/errors"
import { createdResponse, successResponse } from "@/util/response"
import type { Request, Response } from "express"

const cookieOptions={
  httpOnly:true,
  secure:config.env==="production",
  sameSite:"lax" as const,
  path:"/"
}
// register user
export const register=async(req:Request, res:Response)=>{

    const {user}= await authService.registerUser(req.body)
 
     return createdResponse(res, "User registered successfully", {user:{
        id:user._id,
        email:user.email,
        name:user.name,
        isEmailVerified:user.isEmailVerified
     }})


}

// verify email 
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


// login user
export const login=async(req:Request, res:Response)=>{
   const {email, password}=req.body

   if(!email || !password){
    throw new validationErrors("Email and password is required")
   }

  //  login service
  const {accessToken, refreshToken, user}=await authService.login(email, password)

  // we have update the cookie of the browser
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge:15 *60 *1000, // 15 minutes
  })
   res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge:7 *24 *60 *60 *1000, // 7 days
  })


  return successResponse(res, {
    user:{
      id:user._id,
      email:user.email,
      name:user.name || ""
    }
  }, "Login successful")
  
}

// get current user or `/me` route
export const getCurrentUser=async(req:Request, res:Response)=>{
      const user=await authService.getCurrentUser(req?.user?.userId as string)

      return successResponse(res, {
        user:{
          id:user?._id,
          email:user?.email,
          name:user?.name,
        }
      }, "User fetched successfully")
}

// refresh token
export const refreshToken=async(req:Request, res:Response)=>{
    const token=req.cookies?.refreshToken || req.body.refreshToken

    if(!token){
      throw new UnauthorizedError("Refresh token is required")
    }

    // refresh token service
    const tokens=await authService.refreshAccessToken(token)

    res.cookie("accessToken", tokens.accessToken,{
      ...cookieOptions,
      maxAge:15 * 60 * 1000, // 15 minutes
    })


    res.cookie("refreshToken", tokens.refreshToken,{
      ...cookieOptions,
      maxAge:15 * 60 * 1000, // 7 days
    })

    return successResponse(res, "*", "Token refreshed successfully")
}