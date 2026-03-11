import { paymentController } from "@/controllers";
import { authenticate } from "@/middleware";
import { Router } from "express";

const router=Router()

// public routes
router.get("/packages", paymentController.getCreditPackages)
router.use(authenticate)
router.post("/process", paymentController.processPayment)
router.get("/history",paymentController.getPaymentHistory)
export default router