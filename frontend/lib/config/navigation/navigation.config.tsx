import { UserRole } from "@/lib/types";
import { Camera, CreditCard, LayoutDashboard, LucideIcon, Settings, ShoppingCart, User, Users } from "lucide-react";

export interface NavigationItem{
 name:string,
 href:string,
 icon:LucideIcon
 badge?:string | number
}

export interface NavigationConfig{
   [key:string]:NavigationItem[]
}

// navigation for user
export const userNavigation:NavigationItem[]=[
    {
        name:"Dashboard",
        href:"/dashboard/user",
        icon:LayoutDashboard
    },
     {
        name:"Profile",
        href:"/dashboard/user/profile",
        icon:User
    },
    {
        name:"Headshots",
        href:"/dashboard/user/headshots",
        icon:Camera,
          badge:"New"
    },
     {
        name:"Credits",
        href:"/dashboard/user/credits",
        icon:CreditCard
    },
]

// navigation for admin
export const adminNavigation:NavigationItem[]=[
    {
        name:"Dashboard",
        href:"/dashboard/admin",
        icon:LayoutDashboard
    },
     {
        name:"Users",
        href:"/dashboard/admin/users",
        icon:Users
    },
    {
        name:"Orders",
        href:"/dashboard/admin/orders",
        icon:ShoppingCart,
    }
]


// get navigation config based on user role
export const GetNavigationConfig=(role?:UserRole):NavigationItem[]=>{
  switch (role){
    case UserRole.ADMIN:
        return adminNavigation
    case UserRole.USER:
        return userNavigation
    default:
         return userNavigation
  }
}