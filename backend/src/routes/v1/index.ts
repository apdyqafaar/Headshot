import { Router } from "express"
import authRouter from"./auth.route"
import paymentRouter from"./payment.route"
import headshotRouter from"./headshot.route"
import adminRouter from"./admin.user.route"
import adminOrderRoute from"./admin.order.route"


const router=Router()

router.use("/auth", authRouter)
router.use("/payment", paymentRouter)
router.use("/headshot", headshotRouter)
router.use("/admin", adminRouter)
router.use("/admin/orders", adminOrderRoute)


export default router