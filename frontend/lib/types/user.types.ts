export enum UserRole{
  ADMIN='ADMIN',
  USER='USER'
}

export interface User{
    id:string;
    _id:string;
    name?:string;
    email:string;
    password:string;
    isEmailVerified:boolean;
    isActive:boolean;
    credits:number;
    role:UserRole
    createAt:Date;
    updatedAt:Date;
}