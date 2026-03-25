import { config } from "@/config";
import { appError } from "@/util/errors";
import multer from "multer";
import { Request } from "express";

const storage=multer.memoryStorage()

// file filter
const fileFilter=(req:Request, file:Express.Multer.File, cb:multer.FileFilterCallback)=>{
   if(config.upload.allowedImageTypes.includes(file.mimetype)){
    cb(null, true)
   }else{
    cb(new appError("Invalid fle type"))
   }
}

export const upload=multer({
    storage,
    fileFilter,
    limits:{
        fieldSize:config.upload.maxFileSize
    }
})