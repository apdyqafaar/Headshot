"use client"
import { useForm } from "react-hook-form"
import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useLogin } from "@/lib/hooks/useAuth"
import {Loader2} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"



 const loginPageSchema=z.object({
    email:z.email({error:"Invalid email address"}).trim().toLowerCase(),
    password:z.string({message:"Password is required"})
    .min(1,{message:"Password is required"})
})

type loginPageFormValue=z.infer<typeof loginPageSchema>

const loginPage = () => {
  const {mutate:login, isPending}=useLogin()
  const router=useRouter()

    const form=useForm<loginPageFormValue>({
      resolver:zodResolver(loginPageSchema),
        defaultValues:{
            email:"",
            password:"",
        }
    })

    // onsubmit
    const onSubmit=(data:loginPageFormValue)=>{
      // console.log(data)
     login(data,{
        onSuccess:()=>{
          toast.success('User logged in successfully',{
            description:""
          })
          router.push("/")
        },
        onError:(err: any)=>{
          // console.log("err", err?.response)
          toast.error('Login account failed',{
            description:err?.response.data?.message||err?.message ||"Unable to login account, Please try again"
          })
        }
     })

    }
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 ">
      <div className="w-full max-w-md space-y-8 bg-card ">
    <Card className="w-full">
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}  className="space-y-7">
      <CardHeader>
        <CardTitle>Login Account</CardTitle>
        <CardDescription>
          Login to your account to get started with Headshot Pro build
        </CardDescription>
       
      </CardHeader>
      <CardContent  className="space-y-7">
   
             
             {/* email */}
             <FormField control={form.control} name="email" 
            render={({field})=>(
                <FormItem>
                  <FormLabel>
                    Email
                  </FormLabel>
                  <FormControl>
                  <Input
                type="email"
                placeholder="samatar@gmail.com"
                autoComplete="email"
                {...field}
              />
                  </FormControl>
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
              />

              {/* password */}
              <FormField control={form.control} name="password" 
            render={({field})=>(
                <FormItem>
                  <FormLabel>
                    Password
                  </FormLabel>
                  <FormControl>
                  <Input
                type="password"
                placeholder="******"
                autoComplete="password"
                {...field}
              />
                  </FormControl>
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
              />
       
     
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full"
        disabled={isPending}
        >
          {
            isPending?(
              <>
              <Loader2 className="animate-spin w-4 h-4"/>
               Login to your account...
              </>
            ):(
             'Login'
            )
          }
         
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Don 't have an account?{" "}
          <Link href={"/register"} className="font-medium text-foreground hover:underline">
          Sign Up
          </Link>
        </div>
      </CardFooter>
      </form>
      </Form>
    </Card>
      </div>
      
    </div>
  )
}

export default loginPage