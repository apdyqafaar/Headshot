'use client'

import { Button } from "@/components/ui/button"
import { useVerifyEmail } from "@/lib/hooks"
import { AlertCircle, CheckCircle, Loader2, X } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { toast } from "sonner"

function VerifyEMailContent ()  {
    const {mutate, isError, isPending, isSuccess}=useVerifyEmail()

    // getting token on prams
    const searchParams=useSearchParams()
    const token=searchParams.get("token")
    const router =useRouter()

    // useEffect that calls automatically
    useEffect(()=>{
        if(!token) return

        mutate(token, {
            onSuccess:()=>{
                toast.success("Email verified",{
                    description:"Your Email has been verified successfully. Redirecting to login..."
                })

                setTimeout(()=> router.push("/login"), 2000)
            },
            onError:(error:any)=>{
                console.log(error.response?.data)
                toast.error("Verification failed",{
                    description:error.response?.data.message ||error?.message ||"Request failed with status 400"
                })
            }
        })
    },[])


    if(!token){
        return <div className="min-w-full min-h-screen flex items-center justify-center"> 
                    <div className="max-w-md w-full p-6 rounded-lg border border-border">
                        <div className="flex flex-col  w-full space-y-4">
                            <div className="flex items-center justify-center w-full mb-5">

                                <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 "/>
                                </div>
                            </div>

                            <div className="text-center">
                                <h1 className="font-bold text-xl">Invalid Link</h1>
                            </div>

                            <div className="text-center">
                                <p className="text-muted-foreground">Invalid verification Link, Token not provided</p>
                            </div>


                            <div className=" w-full">
                                <Link href={"/register"}>
                                <Button className="w-full">Send again </Button>
                                </Link>
                                
                            </div>
                            

                        </div>
                    </div>
                </div>
        
    }
  return (
 <>
  {isPending&&(
       <div className="min-w-full min-h-screen flex items-center justify-center"> 
                    <div className="max-w-md w-full p-6 rounded-lg ">
                        <div className="flex flex-col  w-full space-y-4">
                            <div className="flex items-center justify-center w-full mb-5">

                                <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center">
                                <Loader2 className="w-5 h-5 animate-spin"/>
                                </div>
                            </div>

                            <div className="text-center">
                                <h1 className="font-bold text-xl">Verifying Email..</h1>
                            </div>

                            <div className="text-center">
                                <p className="text-muted-foreground">We are verifying your email, Please wait..</p>
                            </div>


                            

                        </div>
                    </div>
                </div>
  )}

  {
    isError&&(
        <div className="min-w-full min-h-screen flex items-center justify-center"> 
                    <div className="max-w-md w-full p-6 rounded-lg border border-border">
                        <div className="flex flex-col  w-full space-y-4">
                            <div className="flex items-center justify-center w-full mb-5">

                                <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center">
                                <X className="w-5 h-5 "/>
                                </div>
                            </div>

                            <div className="text-center">
                                <h1 className="font-bold text-xl">Verification Failed</h1>
                            </div>

                            <div className="text-center">
                                <p className="text-muted-foreground">Request failed with status 400</p>
                            </div>


                            <div className=" w-full">
                                <Button className="w-full">Send again </Button>
                            </div>

                              <div className=" w-full">
                                <Link href={"/register"}>
                                <Button className="w-full" variant={"outline"}>Back to register </Button>
                                </Link>
                                
                            </div>
                            
                            

                        </div>
                    </div>
                </div>
    )
  }

  {
    isSuccess&&(
        <div className="min-w-full min-h-screen flex items-center justify-center "> 
                    <div className="max-w-md w-full p-6 rounded-lg border border-border">
                        <div className="flex flex-col  w-full space-y-4">
                            <div className="flex items-center justify-center w-full mb-5">

                                <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 "/>
                                </div>
                            </div>

                            <div className="text-center">
                                <h1 className="font-bold text-xl">Email Verified</h1>
                            </div>

                            <div className="text-center">
                                <p className="text-muted-foreground">Your Email has been verified successfully. Redirecting to login...</p>
                            </div>


                            <div className=" w-full">
                                <Link href={"/login"}>
                                <Button className="w-full">Continue to login</Button>
                                </Link>
                                
                            </div>
                            

                        </div>
                    </div>
                </div>
    )
  }
 </>
  )
}



export  default function verifyEMailPage(){
 
    return (
        <Suspense fallback={<>
          <div className="w-full h-screen flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin"/>
          </div>
        </>}>
         <VerifyEMailContent/>
        </Suspense>
    )
}