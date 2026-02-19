import { getCurrentUserServer } from "@/lib/utils/auth-server"
import { getDashboardPath } from "@/lib/utils/role-util"
import { redirect } from "next/navigation"


const dashboardPage = async() => {
  
    const user=await getCurrentUserServer()
    const dashPath=getDashboardPath(user?.role)
    redirect(dashPath)
}

export default dashboardPage