"use client"

import { Loader, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

const verifyPaymentPage = () => {
    const router=useRouter()
    const searchParams=useSearchParams()
    const sessionId=searchParams.get("session_id")

    useEffect(()=>{
        if(sessionId){
             router.push("/dashboard/user/credits")
             return
        }
        const timer=setTimeout(() => {
            router.push("/dashboard/user/credits")
        }, 5000);

        return ()=>clearTimeout(timer)
    })
  return (
    <div className="flex min-h-screen flex-col min-h-screen items-center justify-self-center bg-background"><div className="text-center space-y-4">
         <Loader2 className="w-12 h-12 text-primary animate-spin"/>
        </div>
         <h2 className="text-xl font-semibold">Payment Successful!</h2>
         <p className="text-sm text-muted-foreground">Processing your credits...</p>
        </div>
  )
}

export default verifyPaymentPage