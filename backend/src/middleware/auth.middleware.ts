import { User, UserRole } from "@/models/User.model"
import { tokenService } from "@/services/auth/token.service"
import { UnauthorizedError } from "@/util/errors"
import { NextFunction, Request, Response } from "express"

// Extend the requests interface to include the user
declare global {
    namespace Express {
        interface Request {
            user?:{
                userId:string,
                email:string,
                role:UserRole
            }
        }
    }
}

export const authenticate=async(req:Request, res:Response, next:NextFunction):Promise<void>=>{
   try {
    // get the token
    let token=req.cookies?.accessToken

    if(!token){
        const authHeaders=req.headers.authorization
        if(authHeaders?.startsWith("Bearer ")){
            token=authHeaders.substring(7)
        }
    }

    if(!token){
        throw new UnauthorizedError("Access token us required")
    }


    // verify token
     const payload= tokenService.verifyAccessToken(token)
    //  TODO: revoke checking if token is revoked

    // verify user exists and active 
     const user =await User.findById(payload.userId)
    if(!user || !user.isActive){
        throw new UnauthorizedError("User is not active or does not exist")
    }

    // attach the user to the request
    req.user={
        userId:user._id.toString(),
        email:user.email,
        role:user.role
    }

    next()
    
   } catch (error) {
    throw new UnauthorizedError("Unauthorized")
   }
}

