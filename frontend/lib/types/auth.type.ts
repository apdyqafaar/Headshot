import { User } from "./user.types"

export interface RegisterInput{
    name:string,
    email:string,
    password:string
}

export interface RegisterResponse{
    user:User
}

export interface veryEmailResponse{
    success:boolean;
    message:string
}


export interface LoginInput{
       email:string,
    password:string
}


export interface loginResponse{
    user:User;
    message:string
}