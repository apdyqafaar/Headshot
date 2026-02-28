"use client"

import { PaymentPlatform } from "@/lib";
import { Button } from "../ui/button";
import { CreditCard, Phone } from "lucide-react";

interface PaymentMethodSelectorProps {
  selectedPlatform: PaymentPlatform;
  onSelectPlatform: (platform: PaymentPlatform) => void;
}
const SelectPaymentSelector = ({onSelectPlatform,selectedPlatform}:PaymentMethodSelectorProps) => {
    const IsLocalPayment=["EVC", "ZAAD", "SAHAL", "EBIRR", "LOCAL"].includes(selectedPlatform)
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <button onClick={()=> onSelectPlatform(PaymentPlatform.STRIPE)}
        className={`${selectedPlatform==="STRIPE"
          ?"bg-primary/7 border-primary"
          :"hover:border-primary/50"
        } p-6 border border-border rounded  flex  bg-card justify-start cursor-pointer` }
        >
        <div className="flex items-center gap-3 
        ">
          <CreditCard className="w-6 h-6 text-primary"/>
          <div className="flex flex-col text-start">
            <h4 className="font-semibold text-foreground">Card Payment</h4>
            <p className="text-sm text-muted-foreground">Debit Card - Instant</p>
          </div>
        </div>
      </button>

      <button onClick={()=> onSelectPlatform(PaymentPlatform.EBIRR)}
        className={`${IsLocalPayment
          ?"bg-primary/7 border-primary"
          :"hover:border-primary/50"
        }  p-6 border border-border rounded  flex  bg-card justify-start cursor-pointer`}
        >
        <div className="flex items-center gap-3
        ">
          <Phone className="w-6 h-6 text-primary"/>
          <div className="flex flex-col text-start">
            <h4 className="font-semibold text-foreground">Mobile MOney</h4>
            <p className="text-sm text-muted-foreground">SAHAL, EBIRR & More.</p>
          </div>
        </div>
      </button>

    </div>
  )
}

export default SelectPaymentSelector