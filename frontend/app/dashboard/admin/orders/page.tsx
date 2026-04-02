"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {  PaymentStatus, useAdminOrder, useAdminUsers, useCreateManual, useGetCreditPackages } from "@/lib"
import { Label } from "@radix-ui/react-label"
import { Loader2, Plus, ShoppingCart } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"


const OrderPage = () => {
    const [page, setPage]=useState(1)
    let limit=10
const [paymentStatus, setPaymentStatus]=useState("")
const [platform, setPlatform]=useState("")
    const {data:users}=useAdminUsers()
    const {data:packages}=useGetCreditPackages()
    const {data:orders, isLoading}=useAdminOrder({limit,page,status:paymentStatus==="all"?"":paymentStatus as string, platform:platform==="all"?"":platform})
    const createOrder=useCreateManual()

    // state of user data and po`aps
    const [open, setOpen]=useState(false)
    const [userid, setUserid]=useState("")
    const [PackageId, setPackageId]=useState("")
    const [amount, setAmount]=useState("")
    

    // handle create
    const handleCreate=async()=>{
        if(!userid || !packages ||!amount){
            toast.error("Please fill all fields")
            return
        }

        try {
            await createOrder.mutateAsync({
                userId:userid,
                packageId:PackageId,
                amount:Number(amount)
            },{
                onSuccess:()=>{
                    toast.success("Order created successfully")
                    setOpen(false)
                    setUserid("")
                    setAmount('')
                    setPackageId("")
                }
            })
        } catch (error:any) {
            toast.error(error.message||"Failed to create order")
        }
    }
    
  return (
    <div className="space-y-6">

        {/* header */}
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-semibold flex items-center gap-2"><ShoppingCart className="w-8 h-6"/>
                Order Management</h1>
                <p className=" text-sm text-muted-foreground mt-1">Create manual orders for users</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="w-4 h-4"/>
                        Create Order
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Create Order Manual
                        </DialogTitle>
                    </DialogHeader>
                
                  {/* user form */}
                    <div className="space-y-4">
                            {/* select user */}
                        <div className="space-y-2">
                            <Label>Select User</Label>
                            <Select value={userid} onValueChange={setUserid}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select user"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        users?.users.map(u=>(
                                            <SelectItem key={u._id} value={u._id}>
                                                {u.email} ({u.credits} credits)
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        {/* select package */}
                        <div className="space-y-2">
                            <Label>Select Package</Label>
                            <Select value={PackageId} onValueChange={(val)=>{
                                setPackageId(val)
                                const pkg=packages?.find(p=>p._id===val)
                                if(pkg) setAmount(pkg.price.toString())
                            }}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select package"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        packages?.map(p=>{
                                            
                                            return <SelectItem key={p._id} value={p._id}>
                                                {p.name} - {p.credits} - {p.price}
                                            </SelectItem>
})
                                    }
                                </SelectContent>
                            </Select>
                        </div>

                        {/* amount */}
                        <div className="space-y-2">
                            <Label>Amount ($)</Label>
                            <Input type="number" placeholder="Enter amount" value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-full"/>
                        </div>
                        <Button onClick={handleCreate} className="w-full" disabled={!userid || !amount || !PackageId||createOrder.isPending}>
                            {createOrder.isPending?"Creating...":"Create"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>

        <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold mb-4">All Orders</h2>
               <div className="flex items-center justify-between gap-3">
                  
                    <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sort status"/>
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    </SelectContent>
                </Select>

                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sort platform"/>
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="STRIPE">Stripe</SelectItem>
                    <SelectItem value="LOCAL">Local</SelectItem>
                    <SelectItem value="EBIRR">Ebirr</SelectItem>
                    <SelectItem value="SAHAL">Sahal</SelectItem>
                    <SelectItem value="EVC">Evc</SelectItem>
                    <SelectItem value="ZAAD">Zaad</SelectItem>
                    </SelectContent>
                </Select>
            </div>

               </div>
              
         
         {
            isLoading?(
                <div className="py-8 text-center">
                    <Loader2 className="w-4 h-4 "/>
                    <p className="text-muted-foreground">Loading orders...</p>
                </div>
            ):orders?.orders.length===0?(
                <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4"/>
                    <h3 className="text=xl font-semibold mb-2">No Orders Yet</h3>
                    <p className="text-muted-foreground">
                        Create your first order using button above
                    </p>
                </div>
            ):(
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Package</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead>Platform</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            orders?.orders.map(o=>(
                                <TableRow key={o._id}>
                                    <TableCell>
                                        {
                                            typeof o.user ==="object" && o.user
                                            ?(o.user as any).email
                                            :typeof o.user ==="string"?o.package:'_'
                                        }
                                    </TableCell>
                                    <TableCell>{o.package.name}</TableCell>
                                    <TableCell>${o.amount}</TableCell>
                                    <TableCell>{o.credits}</TableCell>
                                    <TableCell><Badge variant={"outline"}>{o.platform}</Badge></TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            o.status===PaymentStatus.COMPLETED?"default":o.status===PaymentStatus.PENDING?"secondary":"destructive"
                                        }>{o.status}</Badge>
                                    </TableCell>
                                    <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            )
         }         

         {
            orders?.pagination &&orders.pagination.pages>1 &&(
                <div className="flex items center justify-between mt-4">
                    <p className="text-sm text-muted-foreground whitespace-nowrap">
                        Page {page} of {orders.pagination.pages} ({orders.pagination.total} total)
                    </p>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                 <PaginationPrevious onClick={()=> setPage(p=>p-1)} className={page===1?"pointer-events-none opacity-70":"cursor-pointer"}/>
                            </PaginationItem>
                           <PaginationItem>
                                 <PaginationNext onClick={()=> setPage(p=>p+1)} className={page>=orders.pagination.pages?"pointer-events-none opacity-70":"cursor-pointer"}/>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )
         }                     
        </Card>

    </div>
  )
}

export default OrderPage