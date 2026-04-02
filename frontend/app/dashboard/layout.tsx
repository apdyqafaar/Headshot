
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { UserProvider } from "@/lib/context"
import { getCurrentUserServer } from "@/lib/utils/auth-server"
import { redirect } from "next/navigation"

const dashboardPage = async({children}:{children:React.ReactNode}) => {
   
  const user=await getCurrentUserServer()
  console.log("user on layout", user)
  if(!user){
    return redirect("/auth/login")
  }

  return(
    <UserProvider user={user}>
      <DashboardLayout>
          {children}
      </DashboardLayout>
    </UserProvider>
  )
       
 
} 
 
export default dashboardPage