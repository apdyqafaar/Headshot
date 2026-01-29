import { api } from "../api";
import { RegisterInput, RegisterResponse } from "../types";

export const authService={

    // register new user
    register:async(data:RegisterInput):Promise<RegisterResponse>=>{
     return  api.post<RegisterResponse>("/auth/register", data)
    }
}