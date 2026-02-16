import { getCurrentUserServer } from "@/lib/utils/auth-server"
import { redirect } from "next/navigation"

const dashboardPage = async({children}:{children:React.ReactNode}) => {
   
  const user=await getCurrentUserServer()
  console.log(user)
  if(!user){
    return redirect("/login")
  }

  return children
} 
 
export default dashboardPage