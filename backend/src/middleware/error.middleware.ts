import { appError, validationErrors } from "@/util/errors"
import { loger } from "@/util/logger"
import { errorResponse } from "@/util/response"
import { config } from "@/config"
import {Request, Response, NextFunction} from "express"

export const errorMiddleware=(err:Error,req:Request, res:Response,  next:NextFunction)=>{

    loger.error(err.stack||err.message),{
        message:err.message,
        name:err.name,
        path:req.path,
        method:req.method,
    }
    // handle operational error
    if(err instanceof appError){
        const errors= err instanceof validationErrors?err.errors:undefined
        return errorResponse(res, err.message, err.statusCode, errors)
    }


    // handle mongoose error
    if(err.name==="ValidationError"){
        return errorResponse(res,"ValidationError", 400)
    }

    // handle mongoose duplicate error
    if(err.name==="MongooseServerError" &&(err as any).code ===11000){
        return errorResponse(res, "Duplicate field value", 409)
    }

    // handle JWT errors
    if(err.name==="JsonwebTokenError"){
        return errorResponse(res, "Invalid token", 401)
    }

     // Token expires errors
     if(err.name==="TokenExpiresError"){
        return errorResponse(res, "Token expired", 401)
    }


     // Generic errors
     const message=config.env==="development"?err.message:"Internal Server Error"

     return errorResponse(res, message, 500)
}