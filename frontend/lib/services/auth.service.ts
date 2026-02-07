import { api } from "../api";
import { RegisterInput, RegisterResponse, veryEmailResponse } from "../types";

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
    }
}