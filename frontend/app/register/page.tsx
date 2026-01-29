"use client"
import { useForm } from "react-hook-form"
import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRegister } from "@/lib/hooks/useAuth"
import {Loader2} from "lucide-react"
import Link from "next/link"
 const registerSchema=z.object({
    email:z.email({error:"Invalid email address"}).trim().toLowerCase(),
    password:z.string()
    .min(8,{message:"Password Must be at least 8 characters long"})
    .regex(/[A-Z]/, "Password must contain at least one lowercase")
    .regex(/[a-z]/, "Password must contain at least one uppercase")
    .regex(/[0-9]/, "Password must contain at least one number"),
    name:z.string({message:"Name is required"}).min(1,{message:"Name is required"}).trim()
})

type RegisterFormValue=z.infer<typeof registerSchema>

const registerPage = () => {
  const {mutate, isPending}=useRegister()

    const form=useForm<RegisterFormValue>({
      resolver:zodResolver(registerSchema),
        defaultValues:{
            email:"",
            password:"",
            name:""
        }
    })

    // onsubmit
    const onSubmit=(data:RegisterFormValue)=>{
      // TODO: use register hook
      console.log(data)
    }
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 ">
      <div className="w-full max-w-md space-y-8 bg-card ">
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Sign up to started with Headshot Pro build
        </CardDescription>
       
      </CardHeader>
      <CardContent>
        <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">

              <FormField control={form.control} name="name" 
            render={({field})=>(
                <FormItem>
                  <FormLabel>
                    Full Name
                  </FormLabel>
                  <FormControl>
                  <Input
                type="name"
                placeholder="Samatar Baxnaan"
                autoComplete="name"
                {...field}
              />
                  </FormControl>
                  <FormMessage  />
                </FormItem>
              )}
              />
             
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
                  <FormMessage  />
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
                  <FormDescription>
                    Must be at least 8 characters with uppercase, lowercase and number
                  </FormDescription>
                  <FormMessage  />
                </FormItem>
              )}
              />
        </form>
        </Form>
     
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full"
        disabled={isPending}
        >
          {
            isPending?(
              <>
              <Loader2 className="animate-spin w-4 h-4"/>
               Creating account...
              </>
            ):(
             'Create Account'
            )
          }
         
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={"/login"} className="font-medium text-foreground hover:underline">
          Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
      </div>
      
    </div>
  )
}

export default registerPage