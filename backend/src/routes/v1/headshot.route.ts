import { headshotController } from "@/controllers";
import { authenticate, validate } from "@/middleware";
import { upload } from "@/middleware/upload.middleware";
import { uploadPhotoSchema } from "@/validaors/headshot.validators";
import { Router } from "express";

 const router=Router()

//  all routes are protected
router.use(authenticate)

router.get("/styles", headshotController.getAvailableStyles)
router.post("/generate", upload.single("photo"), validate(uploadPhotoSchema), headshotController.generateHeadshot)
router.get("/", headshotController.getHeadshots)
router.delete("/delete/:id", headshotController.deleteHeadshot)

 export default router