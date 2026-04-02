
import { adminController } from "@/controllers";
import { authenticate, authorize } from "@/middleware";
import { UserRole } from "@/models";
import { Router } from "express";

 const router=Router()

//  all routes are protected
router.use(authenticate)
router.use(authorize(UserRole.ADMIN, "Unauthorized"))
router.get("/users", adminController.getUsers)
router.put("/users/role", adminController.updateUserRole)
router.put("/users/credits", adminController.addCredits)
router.delete("/users/:userId", adminController.deleteUser)

 export default router