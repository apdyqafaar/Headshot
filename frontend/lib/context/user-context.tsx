"use client"

import {  createContext, ReactNode, useContext } from "react"
import { User } from "../types"

interface UserContext{
    user:User | null
}

interface UserProviderProps{
children:ReactNode,
 user:User|null
}
const UserContext=createContext<UserContext|undefined>(undefined)
export const UserProvider=({children, user}:UserProviderProps)=>{
   return (
    <UserContext.Provider value={{user}}>
        {children}
    </UserContext.Provider>
   )
}

export const useUser=()=>{
    const context=useContext(UserContext)
    if(!context) throw new Error("useUser must be used with in a UserProvider")
    return context
}