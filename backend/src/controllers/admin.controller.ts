import { User, UserRole } from "@/models"
import { paymentService } from "@/services"
import { orderServices, userService } from "@/services/admin"
import { appError, NotFoundError, UnauthorizedError } from "@/util/errors"
import { successResponse } from "@/util/response"
import { Request, Response } from "express"
export const getUsers=async(req:Request, res:Response)=>{
    const userId=req.user?.userId
      const adminUser=await User.findById(userId)
      if(!adminUser) throw new NotFoundError("User not found")
      if(adminUser.role !== UserRole.ADMIN){
        throw new UnauthorizedError('Unauthorized')
    }

   const users=await userService.getAllUsers()
   return successResponse(res, users, "Users fetched successfully")
}


export const updateUserRole=async(req:Request, res:Response)=>{
    const adminId=req.user?.userId
    const  {userId, role}=req.body
     if(!userId || !role){
      throw new appError("User id and role are required")
     }

      const adminUser=await User.findById(adminId)
      if(!adminUser) throw new NotFoundError("User not found")
      if(adminUser.role !== UserRole.ADMIN){
        throw new UnauthorizedError('Unauthorized')
    }

   const user=await userService.updateUserRole(role, userId)
   return successResponse(res, user, "User role was updated successfully")
}

export const deleteUser=async(req:Request, res:Response)=>{
    const adminId=req.user?.userId
    const  {userId}=req.params
      if(!userId ){
      throw new appError("User id is required")
     }
      const adminUser=await User.findById(adminId)
      if(!adminUser) throw new NotFoundError("User not found")
      if(adminUser.role !== UserRole.ADMIN){
        throw new UnauthorizedError('Unauthorized')
    }

     await userService.deleteUser(userId as string)
   return successResponse(res, "*", "User deleted successfully")
}

export const addCredits=async(req:Request, res:Response)=>{
      const adminId=req.user?.userId
    const  {userId, credits}=req.body
      if(!userId || !credits){
      throw new appError("User id and credits are required")
     }
      const adminUser=await User.findById(adminId)
      if(!adminUser) throw new NotFoundError("User not found")
      if(adminUser.role !== UserRole.ADMIN){
        throw new UnauthorizedError('Unauthorized')
    }

   const user=await userService.addCredits(userId, credits)
   return successResponse(res, user, "User credits added successfully")
}


// admin order controller
export const getAllOrders=async(req:Request, res:Response)=>{
  const {limit=10, page=1, status, platform}=req.query
   const ordersData=await orderServices.getAllOrders({limit:Number(limit),page:Number(page), status:status as string, platform:platform as string})
   return successResponse(res, ordersData, "Orders fetched successfully")
}

export const createOrderManually=async(req:Request, res:Response)=>{
  const {userId, packageId, amount}=req.body
   const ordersData=await orderServices.createManualOrder({userId, packageId, amount})
   return successResponse(res, ordersData, "Order created successfully")
}

export const getAllPackagesForAdmin=async(req:Request, res:Response)=>{
  const packages=await paymentService.getCreditPackages()
  return successResponse(res, packages, "Packages fetched successfully")
}

