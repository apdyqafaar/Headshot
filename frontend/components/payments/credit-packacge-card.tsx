import { CreditPackacgeCardProps } from "@/lib"
import { Button } from "../ui/button"
import { Check } from "lucide-react"


const CreditPackageCard = ({onSelect, isLoading=false, isSelected=false,package: creditPackage}:CreditPackacgeCardProps) => {
  const totalCredits=creditPackage.credits+(creditPackage.bonus || 0)
  const pricePerCredit=(creditPackage.price /totalCredits).toFixed(2)
  return (
    <div className={`relative rounded-lg border-2 p-6 transition-all
    ${isSelected?"border-primary bg-primary/5 shadow-md"
      :"border-border hover:border-primary/20"
    }${creditPackage.popular?"ring-2 ring-primary/20":""}
    `}>
      {
        creditPackage.popular && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 ">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Most Popular
            </span>
            
          </div>
        )
      }

      <div className="flex flex-col space-y-4 ">
        <div>
            <h3 className="text-xl font-bold text-foreground">{creditPackage?.name}</h3>
            {
              creditPackage.description && (
                <p className="mt-1 text-sm text-muted-foreground">{creditPackage.description}</p>
              )
            }
        </div>

        {/* price */}
        <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">${creditPackage.price.toFixed(2)}</span>
            <span className="ml-2 text-sm text-muted-foreground">USD</span>
        </div>

        {/* info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Base Credits</span>
              <span className="text-sm font-semibold text-foreground">{creditPackage.credits}</span>
            </div>
            {
              creditPackage.bonus && creditPackage.bonus > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600">Bonus Credits</span>
                  <span className="font-semibold text-green-600">+{creditPackage.bonus}</span>
                </div>
              )
            }

            {/* total credits */}
            <div className="border-t pt-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Total Credits</span>
                <span className="text-xl font-bold text-foreground">{totalCredits}</span>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              {pricePerCredit} per credit
            </div>

          </div>

          <Button
          disabled={isLoading}
          onClick={()=>onSelect(creditPackage._id)}
           className="w-full"
            variant={isSelected?"default":"outline"}
          >
            {
              isSelected?(
                <>
                <Check className="mr-2 w-4 h-4"/>
                Selected
                </>
              ):(
                "Select"
              )
            }
          </Button>
      </div>
       </div>
  )
}

export default CreditPackageCard