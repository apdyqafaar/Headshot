"use client"

import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAddCredits, useAdminUsers, useDeleteUser, User, UserRole, useUpdateUserRole } from "@/lib"
import { useUser } from "@/lib/context"
import { Coins, Loader2, Shield, Trash2, Users } from "lucide-react"
import { use, useState } from "react"
import { toast } from "sonner"

const page = () => {
  const {data:users, isLoading:isUsersLoading}=useAdminUsers()
  const { mutateAsync:updateUserRole}=useUpdateUserRole()
  const {mutateAsync:adCreditsUser}=useAddCredits()
  const {mutateAsync:deleteUser}=useDeleteUser()
  // states
  const [selectedUser, setSelectedUser]=useState<User|null>(null)
  const [roleDialogOpen, setRoleDialogOpen]=useState(false)
  const [creditsDialogOpen, setCreditsDialogOpen]=useState(false)
  const [credits, setCredits]=useState("")

  const user=useUser()

  // handle update user role
  const handleUpdateUserRole=async(role:UserRole)=>{
      if(!selectedUser)return
      if(!selectedUser)return
         if(selectedUser._id ===user.user?.id){
        toast.warning("You can not update your role")
        return
      }
      try {
         await updateUserRole({userId:selectedUser._id, role})
         toast.success("Role updated successfully");
         setRoleDialogOpen(false)
      } catch (error:any) {
        toast.error(error?.message || "Failed to update role")
      }
  }

   // handle update add credits user 
  const handleAddCreditsUser=async(userId:string, )=>{
      if(!credits.trim() || !userId)return
      let userCredits=Number(credits)
      try {
         await adCreditsUser({userId,credits:userCredits})
         toast.success("User credits were added successfully");
         setCreditsDialogOpen(false)
      } catch (error:any) {
        toast.error(error?.message || "Failed to add credits user")
      }
  }

   // handle delete user 
  const handleDelete=async(userId:string, )=>{
      if(!userId )return
      if(userId ===user.user?.id){
        toast.warning("You can not delete your account")
        return
      }
      try {
         await deleteUser({userId})
         toast.success("User was deleted success fully successfully");
         setSelectedUser(null)
      } catch (error:any) {
        toast.error(error?.message || "Failed to delete this user")
      }
  }

  // console.log(users?.users)
   if(isUsersLoading){
    return <div className="min-w-full min-h-screen">
      <Loader2 className="w-4 h-4 animate-spin text-primary"/>
    </div>
   }
  return (
    <div className="space-y-6">
      <div >
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8"/>
          <h2 className="text-2xl font-semibold text-foreground">Users Management</h2>
        
        </div>
          <p className="text-muted-foreground text-sm">Manage users, roles, and credits</p>
      </div>

      {/* user table */}
      <Card className="p-6 ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              users?.users.map(user=>(
                <TableRow key={user._id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name||'-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.role==="ADMIN"?"default":"secondary"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.credits}</TableCell>
                  <TableCell>
                    <Badge variant={user.isEmailVerified?"default":"destructive"}>
                      {user.isEmailVerified?"Verified":"Unverified"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog open={roleDialogOpen && selectedUser?._id===user._id} onOpenChange={setRoleDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size={"sm"} variant={"outline"} onClick={()=> setSelectedUser(user)}>
                            <Shield className="w-4 h-4"/>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Role</DialogTitle>
                          </DialogHeader>
                          <Select onValueChange={(value)=>handleUpdateUserRole(value as UserRole)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role"/>
                              <SelectContent>
                                <SelectItem value="USER">User</SelectItem>
                                <SelectItem value="ADMIN">admin</SelectItem>
                              </SelectContent>
                            </SelectTrigger>
                          </Select>
                        </DialogContent>
                      </Dialog>

                      {/* dialog for credits */}
                      <Dialog open={creditsDialogOpen && selectedUser?._id===user._id} onOpenChange={setCreditsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size={"sm"} variant={"outline"} onClick={()=> setSelectedUser(user)}>
                          <Coins className="w-4 h-4 text-primary"/>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add credits</DialogTitle>
                        </DialogHeader>
                        <Input type="number" placeholder="Enter Credits" value={credits} onChange={(e)=>setCredits(e.target.value)}/>
                        <Button disabled={!credits} onClick={()=>handleAddCreditsUser(user._id)}>Add credits</Button>
                      </DialogContent>
                      </Dialog>

                      {/* alert dialog */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size={"sm"} variant={"destructive"}>
                            <Trash2 className="w-4 h-4"/>
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle >
                               Delete User
                            </AlertDialogTitle>
                          
                          </AlertDialogHeader>
                          <AlertDialogDescription>
                             Are you sure you want to delete {user.email}? This action cannot be undone.
                          </AlertDialogDescription>
                          <div className="flex items-center gap-2">
                            <AlertDialogAction variant={"destructive"} onClick={()=>handleDelete(user._id)}>Delete</AlertDialogAction>
                          <AlertDialogAction variant={'outline'}onClick={()=>setSelectedUser(null)}>Cancel</AlertDialogAction>
                          </div>
                          
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

export default page