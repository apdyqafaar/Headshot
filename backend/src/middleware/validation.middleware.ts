
import { appError, validationErrors } from "@/util/errors"
import { loger } from "@/util/logger"
import {Request, Response ,NextFunction}from"express"
import {z, ZodError} from "zod"

export const validate=(schema:z.ZodType<any>)=>{
  
    return (req:Request, res:Response, next:NextFunction)=>{
        try {
            const validated=schema.parse(req.body)
            req.body=validated
            next()


        } catch (error) {
            if(error instanceof ZodError){
            // extract zod error
            const errors=error.issues.map(err=>({
                path:err.path.join("."),
                message:err.message
            }))

            loger.error("Zod validation ",errors)
              next(new validationErrors("Validation error",errors))
            }

            next(new appError("Validation error", 400, "VALIDATION_ERROR", true))
            loger.error(error)

        }
    }
}


export const validateQuery=(schema:z.ZodType<any>)=>{
     return (req:Request, res:Response, next:NextFunction)=>{
        try {
            const validated=schema.parse(req.query)
            Object.assign(req.query, validated)

            next()
        } catch (error) {
            if(error instanceof ZodError){
                // extract zod error
                const errors=error.issues.map(err=>({
                    path:err.path.join("."),
                    message:err.message
                }))
    
                loger.error("Zod validation ",errors)
                  next(new validationErrors("Validation error",errors))
                }
    
                next(new appError("Validation error", 400, "VALIDATION_ERROR", true))
                loger.error(error)
    
        }
     }
}