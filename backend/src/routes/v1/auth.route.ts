import { authController } from "@/controllers";
import { validate, validateQuery } from "@/middleware/validation.middleware";
import { registerSchema, resendVerificationSchema, verifyEmailSchema } from "@/validaors/auth.validator";
import { Router } from "express";



const authRouter=Router()

authRouter.post("/register", validate(registerSchema), authController.register)
authRouter.get("/verify-email", validateQuery(verifyEmailSchema), authController.verifyEmail)
authRouter.post("/resend-verification", validate(resendVerificationSchema),authController.resendVerificationEmail)

export default authRouter