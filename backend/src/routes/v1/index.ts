import { Router } from "express"
import authRouter from"./auth.route"
import paymentRouter from"./payment.route"
import headshotRouter from"./headshot.route"


const router=Router()

router.use("/auth", authRouter)
router.use("/payment", paymentRouter)
router.use("/headshot", headshotRouter)


export default router