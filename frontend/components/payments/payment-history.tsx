"use client"
import { PaymentHistoryProps, PaymentStatus } from "@/lib"
import { AlertCircle, CheckCircle, CheckCircle2, Clock, CreditCard, Loader2, XCircle } from "lucide-react"

const statusConfig:Record<PaymentStatus, {label:string, icon:React.ComponentType<any>, className:string}>={
  Pending:{label: "Pending", icon: Clock, className: "text-yellow-500"},
  Success:{label: "Success", icon: CheckCircle2, className: "text-green-500"},
  Failed:{label: "Failed", icon: XCircle, className: "text-red-500"},
  Completed:{label: "Completed", icon: CheckCircle, className: "text-green-500"},
  Refunded:{label: "Refunded", icon: AlertCircle, className: "text-gray-500"},
  Processing:{label: "Processing", icon: AlertCircle, className: "text-blue-500"},
}

const PaymentHistory = ({orders, isLoading}:PaymentHistoryProps) => {

    if(isLoading){
        return <div className="space-y-4">
            {
                [...Array(10)].map((_, index) => (
                    <div key={index} className="h-24 animate-pulse rounded-lg bg-muted"/>
                ))
            }
        </div>
    }

    if(!orders || orders.length === 0){
        return <div className="rounded-lg border border-dashed p-12 bg-muted/50 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No payment history found</h3>
            <p className="mt-2 text-sm text-muted-foreground">You haven't made any payments yet, Your payments will appear here.</p>
        </div>
    }

  return (
    <div className="space-y-4">
        {orders.map((order) => {
            const {label, icon, className} = statusConfig[order.status]
            const StatusIcon=icon
            const formattedData=new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            return <div key={order._id} className="rounded-lg border p-6 bg-card transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                <div className="flex items-center space-x-3">
                    <h4 className="font-semibold text-foreground">{order.package.name}</h4>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
                        <StatusIcon />
                        {label}
                    </span>
                </div>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>{order.credits} credits purchased</p>
                    <p>Payment Platform: {order.platform}</p>
                    <p>{formattedData}</p>

                </div>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                        {order.amount.toFixed(2)}
                    </div>
                </div>
               
              </div>
            </div>
        })}
    </div>
    
    )}

export default PaymentHistory