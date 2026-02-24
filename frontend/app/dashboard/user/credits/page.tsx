'use client'

import CreditsHeader from "@/components/payments/credits-header"
import StripeRedirectHandler from "@/components/payments/stripe-redirect-handler"
import { PaymentPlatform } from "@/lib"
import { useUser } from "@/lib/context"
import { useGetCreditPackages, useProcessPayment } from "@/lib/hooks/usePayment"
import { Loader2 } from "lucide-react"
import { useState } from "react"

const creditsPage = () => {
  const {user}=useUser()

  // state
  const [selectedPackageId, setSelectedPackageId]=useState<string |null>(null)
  const [selectedPlatform, setSelectedPlatform]=useState<PaymentPlatform>(PaymentPlatform.STRIPE)
  const [showLocalForm, setShowLocalForm]=useState(false)
  const [showHistory, setShowHistory]=useState(false)

  // use credits
  const {data:packages , isLoading:isLoadingCredits, error}=useGetCreditPackages()
  //  console.log(packages)
  const {mutate:processPayment, isPending:isVerifying}=useProcessPayment()

  const handleSelected=(packageId:string)=>{
     setSelectedPackageId(packageId)
     setShowLocalForm(false)
  }

   const handleSelectedPlatform=(platform:PaymentPlatform)=>{
     setSelectedPlatform(platform)
     const IsLocalPayment=["EVC", "ZAAD", "SAHAL", "EBIRR", "LOCAL"].includes(platform)
     setShowLocalForm(IsLocalPayment)
  }

 const selectedPackage=packages?.find(pcg=>pcg._id ===selectedPackageId)
 const handleVerifyingPayment=(sessionId:string)=>{
console.log("sessionId ",sessionId)
 }

  if(isLoadingCredits){
    return <div className="w-full h-full flex items-center justify-center">
       <Loader2 className="w-4 h-4 animate-spin"/>
    </div>
  }
  return (
    <div className="space-y-8">
      <StripeRedirectHandler
        onVerify={handleVerifyingPayment}
        isVerifying={isVerifying}
      />
      <CreditsHeader credits={user?.credits as number}onToggleHistory={()=>setShowHistory(!showHistory)} 
      showHistory={showHistory}/>
    </div>
  )
}

export default creditsPage