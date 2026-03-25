"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { getCreditPackage, getPaymentHistory, processPayment } from "../services/payment.service"
import { ProcessPaymentParams } from "../types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"


export const useGetCreditPackages=()=>{
    return useQuery({
        queryKey:["credit-packages"],
        queryFn:()=>getCreditPackage(),
        staleTime:5 *60*1000,
        retry:2
    })
}

export const usePaymentHistory=(limit:number)=>{
    return useQuery({
        queryKey:["credit-history", limit],
        queryFn:()=>getPaymentHistory(limit),
        staleTime:5 *60*1000,
        retry:2
    })
}  

export const useProcessPayment=()=>{
    const router=useRouter()
    return useMutation({
       mutationFn:(params:ProcessPaymentParams)=>processPayment(params) ,
       onSuccess:(data)=>{
        if(data.redirectUrl){
            window.location.href=data.redirectUrl
        }else{
            toast.success(data.message|| "Payment processed successfully")
            router.push("/dashboard/user/credits?status=pending")
        }
       }
    })
}