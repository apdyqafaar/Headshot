import { Router } from "express"
import authRouter from"./auth.route"
import paymentRouter from"./payment.route"


const router=Router()

router.use("/auth", authRouter)
router.use("/payment", paymentRouter)


export default router