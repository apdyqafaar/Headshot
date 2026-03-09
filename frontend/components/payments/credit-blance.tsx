import { Wallet } from "lucide-react"

interface CreditBalanceProps{
    credits:number
}

export const CreditBalance = ({credits}:CreditBalanceProps) => {
  
  return (
    <div className="px-4 py-2 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary mt-3"/>
            <div>
                <p className="text-xs text-muted-foreground">Yor Balance</p>
                <p className="text-foreground text-xl font-bold">{credits || 0}</p>
            </div>
        </div>
    </div>
  )
}
