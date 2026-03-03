"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useResendVerification } from "@/lib/hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

const resendVerificationSchema=z.object({
    email:z.email({message:"Invalid email format"}).trim().toLowerCase()
})
type ResendVerificationFormValues=z.infer<typeof resendVerificationSchema>

const ResendVerificationPage = () => {
   const router=useRouter()

    // mutation
     const {mutate:resendVerification, isPending, isError}=useResendVerification()

    //  from controlling
    const form=useForm<ResendVerificationFormValues>({
        resolver:zodResolver(resendVerificationSchema),
        defaultValues:{
            email:""
        }
    })


    // calling the api
    const onsubmit=(data:ResendVerificationFormValues)=>{
        resendVerification(data.email, {
            onSuccess:()=>{
                toast.success("Verification email sent successfully", {
                     description:"Please check your email for the verification link"
                })
                form.reset()
                router.push("/auth/login")
            },
            onError:(err :any)=>{
                toast.error("Failed to send verification email", {
                    description:err.response.data.message || err.message||"Failed to send verification email"
                })
            }
        })
    }
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
        <div className="max-w-sm w-full flex flex-col space-y-2">
            <div>
                <h1 className="text-xl font-bold">Resend Verification Email</h1>
            </div>
            <div>
                <p className="text-muted-foreground text-sm">Enter your email address and we'll send you new verification link.</p>
            </div>
            <Form {...form}  >
                    <form onSubmit={form.handleSubmit(onsubmit)} className="mt-4 space-y-3">
                        <FormField
                        control={form.control}
                        name="email"
                        render={({field})=>(
                             <FormItem>
                                <FormLabel>Email address</FormLabel>
                                <FormControl>
                                    <Input
                                     type="email"
                                     placeholder="you@axample.com"
                                     autoComplete="email"
                                     {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                        />
                        <Button type="submit" disabled={isPending} className="w-full">
                            {
                                isPending?(
                                    <>
                                     <Loader2 className="mr-2 h-2 animate-spin"/>
                                     Sending...
                                    </>
                                ):(
                                    "Send Verification Email"
                                )
                            }
                        </Button>
                    </form>
            </Form>
            <div className="text-center ">
                <Link href={"/login"} className="text-muted-foreground  hover:text-foreground text-sm">
                   Back to Login
                </Link>
            </div>
        </div>
    </div>
  )
}

export default ResendVerificationPage