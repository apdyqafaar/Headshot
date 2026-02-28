"use client"

import { Phone } from "lucide-react"
import { type FormEvent, useState } from "react"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

const PAYMENT_METHODS = [
    {
        id: "EVC",
        name: "EVC Plus",
        icon: Phone,
        description: "Pay with EVC Plus mobile money"
    },
    {
        id: "ZAAD",
        name: "ZAAD Service",
        icon: Phone,
        description: "Pay with ZAAD service"
    },
    {
        id: "SAHAL",
        name: "SAHAL",
        icon: Phone,
        description: "Pay with SAHAL mobile money"
    },

    {
        id: "EBIRR",
        name: "EBIRR",
        icon: Phone,
        description: "Pay with EBIRR mobile money (ETB)"
    },
    {
        id: "LOCAL",
        name: "LOCAL Payment",
        icon: Phone,
        description: "Request manual payment approval"
    },
]

interface LocalPaymentFormProps{
   packageId:string,
   isLoading:boolean,
   onSubmit:(selectedMethod:string, phone:string)=>void
}
const localPaymentForm = ({isLoading=false,onSubmit,packageId}:LocalPaymentFormProps) => {
    const [phone, setPhone]=useState<string>("")
    const [selectedMethod, setSelectedMethod]=useState<string>("EVC")

    const handleSubmit=(e:FormEvent)=>{
      e.preventDefault()
      if(phone.trim()){
        onSubmit(selectedMethod, phone)
      }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                    Choose Payment Method
                </h3>

                {/* Payment Method Selection */}
                <div className="mb-6 space-y-2">
                    <Label>Payment Method</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {
                            PAYMENT_METHODS.map(method=>{
                                const Icon=method.icon
                                return(
                                    <Button type="button" variant={"outline"} key={method.id} onClick={()=>setSelectedMethod(method.id)}
                                     disabled={isLoading}
                                     className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all
                                        ${selectedMethod===method.id
                                            ?"border-primary bg-primary/10"
                                            :"border-border hover:border-primary/30"
                                        }
                                        `}
                                    >
                                        <div className={`p-2 rounded-lg
                                            ${selectedMethod===method.id
                                                ?"bg-primary/10 text-primary"
                                                :"bg-muted text-muted-foreground"
                                            }
                                            `}>
                                                <Icon className="w-5 h-5"/>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-medium text-foreground">{method.name}</p>
                                            <p className="text-sm text-muted-foreground">{method.description}</p>
                                        </div>
                                        <div
                                         className={`h-4 w-4 rounded-full border transition-all
                                            ${selectedMethod
                                                ?"border-[6px] border-primary"
                                                :"border-2 border-muted-foreground"
                                            }
                                            `}
                                        />

                                     
                                    </Button>
                                )
                            })
                        }
                    </div>
                </div>

                {/* phone */}
                <div className="space-y-4">

                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                         id="Phone"
                         type="tel"
                         placeholder="+251 XX XXX XXX"
                         value={phone}
                         onChange={(e)=> setPhone(e.target.value)}
                         required
                         disabled={isLoading}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                            {
                                selectedMethod==="LOCAL"
                                ?"We'll contact you to confirm payment"
                                :"Enter your mobile number"
                            }
                        </p>

                    </div>

                    {/* payment instructions */}
                    <div className="rounded-md bg-muted p-4 space-y-2">
                        <p className="text-sm font-medium text-foreground">
                            Payment instructions
                        </p>
                        <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                            <li>
                                Use the phone number that is registered to your mobile money account.
                            </li>
                            <li>
                                After you submit this form, follow the steps shown on your mobile money app or the SMS you receive to complete the payment.
                            </li>
                            {
                                selectedMethod==="LOCAL"
                                ?(
                                    <li>
                                        For LOCAL payments, our team will review your request and contact you with manual approval details.
                                    </li>
                                ):(
                                    <li>
                                        Payments are usually confirmed within a few minutes; your credits will be added automatically once the payment is verified.
                                    </li>
                                )
                            }
                        </ul>
                    </div>

                    {/* Ebirr Currency Notice */}
                    {
                        selectedMethod==="EBIRR"&&(
                            <div className="rounded-md bg-yellow-50
                             dark:bg-yellow-950 border border-yellow-50 dark:border-yellow-700 p-4 text-sm
                            ">

                                <p className="font-medium text-yellow-800 dark:text-yellow-200">Currency Conversation</p>
                                <p className="mt-1 text-yellow-700 dark:text-yellow-200">
                                    Payment will be processed in Ethiopian Birr (ETB) using current change exchange rate
                                </p>
                            </div>
                        )
                    }
                    <Button type="submit" className="w-full" disabled={isLoading|| !phone.trim()}>
                        {
                            isLoading?"Processing...":"Complete Payment"
                        }
                    </Button>
                </div>
            </div>
        </form>
    )
}

export default localPaymentForm