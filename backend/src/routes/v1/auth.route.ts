import { register } from "@/controllers";
import { validate } from "@/middleware/validation.middleware";
import { registerSchema } from "@/validaors/auth.validator";
import { Router } from "express";



const authRouter=Router()

authRouter.post("/register", validate(registerSchema), register)

export default authRouter