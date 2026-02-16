import { cookies } from "next/headers"
import { User } from "../types"

export const getCurrentUserServer=async()=>{
  
    const cookieStore=await cookies()
    const accessToken=cookieStore.get("accessToken")?.value
    if(!accessToken) return null

    try {
        // call our backend api to get current user
        const response=await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/auth/me`,{
            headers:{
                Cookie:`accessToken=${accessToken}`
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
}