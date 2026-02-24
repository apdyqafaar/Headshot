"use client"

import { History } from "lucide-react"
import { Button } from "../ui/button"
import { CreditBalance } from "./credit-blance"

interface CreditsHeaderProps{
    credits:number,
    showHistory:boolean,
    onToggleHistory:()=> void
}
const CreditsHeader = ({credits,onToggleHistory, showHistory}:CreditsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-semibold text-foreground">By Credits</h1>
           <p className="mt-2 text-muted-foreground">Purchase credits to generate AI headshot</p>  
        </div>
        
        <div className="flex items-center gap-4">
            <CreditBalance credits={credits}/>
            <Button variant={"outline"} onClick={onToggleHistory}>
                <History className="ml-2 w-4 h-4"/>
                {showHistory?"View Packages":"View history"}
            </Button>
        </div>
       
    </div>
  )
}

export default CreditsHeader