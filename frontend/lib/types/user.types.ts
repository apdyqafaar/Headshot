export type UserRole="user" | "admin"

export interface User{
    id:string;
    name:string;
    email:string;
    password:string;
    isEmailVerified:boolean;
    isActive:boolean;
    credits:number;
    role:UserRole
    createAt:Date;
    updatedAt:Date;
}