"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"


interface StripeRedirectHandlerProps{
  onVerify:(sessionId:string)=>void,
  isVerifying:boolean
}
const StripeRedirectHandler = ({isVerifying,onVerify}:StripeRedirectHandlerProps) => {
  const router=useRouter()
  const searchParams=useSearchParams()

  useEffect(()=>{
    const sessionId=searchParams.get("session_id")
    const status=searchParams.get("status")
    if(sessionId && !isVerifying){
      onVerify(sessionId)
      router.replace('/dashboard/user/credits')
    }else if(status==="pending"){
      toast.success("Payment request submitted. Awaiting admin approval")
    }else if(status==="canceled"){
      toast.success("Payment was canceled")
    }
  },[searchParams, onVerify, isVerifying, router])
  return null
}

export default StripeRedirectHandler