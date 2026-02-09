import { useMutation } from "@tanstack/react-query"
import { LoginInput, RegisterInput } from "../types"
import { authService } from "../services/auth.service"

export const authkeys={
  all:["auth"] as const,
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
    return useMutation({
        mutationFn:(data:LoginInput)=> authService.login(data)
    })
}