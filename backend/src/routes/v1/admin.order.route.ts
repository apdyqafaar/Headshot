import { adminController } from "@/controllers";
import { authenticate, authorize } from "@/middleware";
import { UserRole } from "@/models";
import { Router } from "express";


 const router=Router()

//  all routes are protected
router.use(authenticate)
router.use(authorize(UserRole.ADMIN, "Unauthorized"))
router.get("/", adminController.getAllOrders)
router.post("/manual", adminController.createOrderManually)
router.get("/packages", adminController.getAllPackagesForAdmin)
 export default router