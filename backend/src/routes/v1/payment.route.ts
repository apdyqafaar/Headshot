import { Router } from "express";

const router=Router()

router.get("/webhook", (req, res)=>{
  res.json({
    message:"received web hook"
  })
})

export default router