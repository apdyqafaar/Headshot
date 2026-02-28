"use client"

import { CreditPackage } from "@/lib"
import { Button } from "../ui/button"
import { Loader2 } from "lucide-react"

interface StripeCheckoutSectionProps{
    package:CreditPackage,
    onCheckout:()=>void,
    isLoading:boolean
}
const StripeCheckoutSection = ({isLoading, onCheckout,package:pkg}:StripeCheckoutSectionProps) => {
  return (
    <div className="space-y-4">
        <div className="rounded-md bg-muted p-4">
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Package</span>
                <span className="font-semibold text-foreground">{pkg.name||""}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Credits</span>
            <span className="font-semibold text-foreground">{pkg.credits +(pkg.bonus||0)||0}</span>
            </div>

            <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="font-semibold text-foreground">{pkg.price||0}</span>
            </div>
        </div>
        <Button
        onClick={onCheckout}
        disabled={isLoading}
        className="w-full" size={"lg"}
        >
            {
                isLoading?(
                    <>
                    <Loader2 className="w-4 h-4"/> 
                    Processing
                    </>
                ):(
                    <>
                    Process to Checkout
                    </>
                )
            }
        </Button>
    </div>
  )
}

export default StripeCheckoutSection