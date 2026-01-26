import { config } from "@/config"
import { loger } from "@/util/logger"
import mongoose from "mongoose"

export const connectDatabase=async():Promise<void>=>{
 try {
    await mongoose.connect(config.database.url)
    loger.info("Connected to database")
 } catch (error) {
    loger.error("Error Connecting to database ", error)
 throw error
 }
}

mongoose.connection.on("disconnected", ()=>{
    loger.error("Disconnected from database")
    throw new Error("Disconnected from database")
})

mongoose.connection.on("error", (error)=>{
    loger.error("Error Connecting to database ", error)
 throw error
})