import { register } from "@/controllers";
import { validate, validateQuery } from "@/middleware/validation.middleware";
import { registerSchema, verifyEmailSchema } from "@/validaors/auth.validator";
import { Router } from "express";



const authRouter=Router()

authRouter.post("/register", validate(registerSchema), register)
authRouter.get("/verify-email", validateQuery(verifyEmailSchema))

export default authRouter