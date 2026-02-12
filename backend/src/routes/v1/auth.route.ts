import { authController } from "@/controllers";
import { authenticate } from "@/middleware";
import { validate, validateQuery } from "@/middleware/validation.middleware";
import { loginSchema, registerSchema, resendVerificationSchema, verifyEmailSchema } from "@/validaors/auth.validator";
import { Router } from "express";



const authRoute=Router()

authRoute.post("/register", validate(registerSchema), authController.register)
authRoute.get("/verify-email", validateQuery(verifyEmailSchema), authController.verifyEmail)
authRoute.post("/resend-verification", validate(resendVerificationSchema),authController.resendVerificationEmail)

// login
authRoute.post("/login", validate(loginSchema), authController.login)

// get current user
authRoute.get("/me", authenticate, authController.getCurrentUser)

// refresh token
authRoute.post("/refresh-token",  authController.refreshToken)

export default authRoute