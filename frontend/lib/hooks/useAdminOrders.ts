import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminOrderService } from "../services/admin.order.service";

export function useAdminOrder(params:{limit:number, page:number, status?:string, platform?:string}){
    return useQuery({
        queryKey:['admin-orders', params],
        queryFn:()=>adminOrderService.getAllOrders(params)
    })
}

export function useCreateManual(){
    const queryClient=useQueryClient()
 return useMutation({
    mutationFn:(data:{userId:string, packageId:string, amount:number})=>adminOrderService.createManual(data),
    onSuccess:()=>{
        queryClient.invalidateQueries({queryKey:['admin-orders']})
    }
 })
}