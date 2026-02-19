import { UserRole } from "../types";

export function isAdmin(role?:UserRole){
    return role===UserRole.ADMIN
}

export function isUser(role?:UserRole){
    return role===UserRole.USER
}

export function getDashboardPath(role?:UserRole){
    return isAdmin(role)?"/dashboard/admin":"/dashboard/user"
}


export function getDisplayName(role?:UserRole):string{
   if(!role) return "UNKNOWN"
   return role.charAt(0).toUpperCase()+role.slice(1)
}
