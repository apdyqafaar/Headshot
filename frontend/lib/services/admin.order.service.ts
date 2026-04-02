import { api } from "../api"
import { Order } from "../types"

export const adminOrderService={
    
    getAllOrders:async(params:{limit:number, page:number, status?:string, platform?:string}):Promise<{orders:Order[], pagination:{
        limit:number, page:number, total:number, skip:number, pages:number
    }}>=>{
        const query=new URLSearchParams(params as any).toString()
        return api.get<{orders:Order[], pagination:{
        limit:number, page:number, total:number, skip:number, pages:number
    }}>(`/admin/orders${query? `?${query}`:""}`, )
    },


    createManual:async(data:{userId:string, packageId:string, amount:number}):Promise<{order:Order}>=>{
        return api.post<{order:Order}>('/admin/orders/manual', data)
    }
}