"use client"
import { Button } from "@/components/ui/button";
import { useCUrrentUser } from "@/lib";
import Link from "next/link";

export default function Home() {
  const {data:currentUser, error}=useCUrrentUser()
  // console.log(currentUser)
  return (
    <div>
     <div className="flex items-center justify-between p-20">
   <h1>Logo</h1>
   {
    (
      !currentUser?(
       <Button variant={"link"}>
          <Link href={"/auth/login"}>
         login
        </Link>
       </Button>
      ):(
         <span>Welcome {currentUser?.name}</span> 
      )
    )
   }

   
 
 </div> 

 <Link href={"/dashboard/admin"}>
  <Button>Go to dashboard Admin</Button>
 </Link>
 <Link href={"/dashboard/user"}>
  <Button>Go to dashboard User</Button>
 </Link>
    </div>
 
  );
}
