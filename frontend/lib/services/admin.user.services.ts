import { api } from "../api"
import { User } from "../types"

export const adminUserServices={
    getAllUsers:async():Promise<{users:User[], total:number}>=>{
        return api.get<{users:User[], total:number}>("/admin/users")
    }
    ,
    deleteUser: async (userId: string): Promise<void> => {
        return api.delete<void>(`/admin/users/${userId}`);
    },
    addCredits: async (userId: string, credits: number): Promise<User> => {
        return api.put<User>(`/admin/users/credits`, {userId, credits });
    },
    updateUserRole: async (userId: string, role: string): Promise<User> => {
        return api.put<User>(`/admin/users/role`, {userId, role });
    }
}