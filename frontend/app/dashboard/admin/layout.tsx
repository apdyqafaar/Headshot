import { UserRole } from "@/lib"
import { getCurrentUserServer } from "@/lib/utils/auth-server"
import { redirect } from "next/navigation"

const adminDashboard = async({children}:{children:React.ReactNode}) => {
    const user=await getCurrentUserServer()
    if(!user || user.role !== UserRole.ADMIN){
      redirect("/dashboard/user")
    }

  return children
} 
 
export default adminDashboard