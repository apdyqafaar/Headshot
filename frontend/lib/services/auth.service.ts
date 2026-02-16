import { api } from "../api";
import { LoginInput, loginResponse, RegisterInput, RegisterResponse, User, veryEmailResponse } from "../types";

export const authService={

    // register new user
    register:async(data:RegisterInput):Promise<RegisterResponse>=>{
     return await api.post<RegisterResponse>("/auth/register", data)
    },

    // verify email
    VerifyEmail:async(token:string):Promise<veryEmailResponse>=>{
        return await api.get(`/auth/verify-email?token=${token}`)
    },
    
    // resend verification
    resendVerification:async(email:string):Promise<veryEmailResponse>=>{
        return await api.post<veryEmailResponse>("/auth/resend-verification", {email})
    },

    // login
    login: async(data:LoginInput):Promise<loginResponse>=>{
    return await api.post<loginResponse>("/auth/login", data)
    },

    // get current user
    getCUrrentUser: async():Promise<User>=>{
    return await api.get<User>("/auth/me")
    }

}