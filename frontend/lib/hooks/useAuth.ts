import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { LoginInput, RegisterInput } from "../types"
import { authService } from "../services/auth.service"

export const authKeys={
  all:["auth"] as const,
  currentUser:()=>[...authKeys.all, "currentUser"] as const 
}



export const useRegister =()=>{
    return useMutation({
        mutationFn:(data:RegisterInput)=> authService.register(data)
    })
}


export const useVerifyEmail=()=>{
    return useMutation({
        mutationFn:(token:string)=>  authService.VerifyEmail(token)
    })
}



export const useResendVerification=()=>{
    return useMutation({
        mutationFn:(email:string)=>  authService.resendVerification(email)
    })
}


export const useLogin=()=>{
    const queryClient= useQueryClient()
    return useMutation({
        retry:false,
        mutationFn:(data:LoginInput)=> authService.login(data),
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:authKeys.currentUser()})
        }
    })
}

export const useCUrrentUser=(options?:{redirectOnError?:boolean})=>{
    return useQuery({
        queryKey:authKeys.all,
        queryFn:()=> authService.getCUrrentUser(),
        staleTime:5 * 60 *1000, // 5minutes
        retry:false,
        throwOnError:(error)=> {
            if(options?.redirectOnError && typeof window !== "undefined"){
                window.location.href="/auth/login"
            }
            return false
        },
    })
}

export const useLogout=()=>{
    return useMutation({
        mutationFn:()=>authService.logout()
    })
}