import { cookies } from "next/headers"
import { User } from "../types"
import { cache } from "react"
import axios from "axios"


export const getCurrentUserServer=cache(async()=>{
  
    const cookieStore=await cookies()
    const cookieHeader = cookieStore.toString();
    const accessToken=cookieStore.get("accessToken")?.value
    const refreshToken=cookieStore.get("refreshToken")?.value
    if(!accessToken) return null
    try {
        // call our backend api to get current user
        const response=await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/auth/me`,{
            headers:{
                Cookie:cookieHeader
            },
            credentials:"include",
            cache:"no-cache"
        })
        if(!response.ok)return null

        const data=await response.json()
        return data.data as User
    } catch (error) {
        console.error("Error fetching current user: ", error)
        return null
    }
})