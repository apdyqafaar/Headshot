import { Response } from "express";


// Interface
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    errors?: Record<string, string>[],
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number
    }
}


// success response
export const successResponse = <T>(res: Response, data: T, message: string, statusCode: number = 200, meta?: ApiResponse["meta"]):Response => {
  

    //preparing the response
    const response:ApiResponse<T>={
        success:true,
        message,
        ...(data !==undefined &&{data}),
        ...(meta !==undefined &&{meta}),
    }

   

    return res.status(statusCode).json(response)
}


// error response
export const errorResponse=<T>(res:Response, message:string, statusCode:number, errors?:Record<string, string>[]):Response=>{
  

    // preparing the response
    const response:ApiResponse<T>={
      success:false,
      message,
      ...(errors !==undefined &&{errors})
    }

    return res.status(statusCode).json(response)
}


// create response
export const createdResponse=<T>(res:Response, message:string, data?:T)=>{
 return successResponse(res, data, message, 201)
}

// no content response
export const noContentResponse=(res:Response):Response=>{
 return res.status(204).send()
}

// pagination response
export const paginationResponse=<T>(res:Response, message:string, data:T[], pagination:{
    page:number;
    limit:number;
    total:number;
}):Response=>{

    const totalPages=Math.ceil(pagination.total / pagination.limit)
    return successResponse(res,data,message,200,{
        limit:pagination.limit,
        page:pagination.page,
        total:pagination.total,
        totalPages
    })
}