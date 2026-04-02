import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminUserServices } from "../services/admin.user.services"
import { UserRole } from "../types"

export const useAdminUsers=()=>{
    return useQuery({
        queryKey:["admin-users"],
        queryFn:()=> adminUserServices.getAllUsers()
    })
}

export const useUpdateUserRole=()=>{
    const queryClient=useQueryClient();
    return useMutation({
        mutationFn:({role,userId}:{userId:string, role:UserRole})=> adminUserServices.updateUserRole(userId, role),
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["admin-users"]})
        }

    })
}

export const useAddCredits=()=>{
    const queryClient=useQueryClient();
    return useMutation({
        mutationFn:({credits,userId}:{userId:string, credits:number})=> adminUserServices.addCredits(userId, credits),
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["admin-users"]})
        }

    })
}

export const useDeleteUser=()=>{
    const queryClient=useQueryClient();
    return useMutation({
        mutationFn:({userId}:{userId:string, })=> adminUserServices.deleteUser(userId),
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["admin-users"]})
        }

    })
}