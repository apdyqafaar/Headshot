import app from "@/app";
import { config } from "@/config";
import { connectDatabase } from "@/database/connection";
import { loger } from "./util/logger";

const startServer = async() => {
  try {
    // connect to database 
    await connectDatabase()
    const server = app.listen(config.port, () => {
      console.log("Server is running on 8000 port...");
      loger.info("Server is running on 8000 port...");
    });

    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.log(`Port ${config.port} is already in use`);
        loger.error(`Port ${config.port} is already in use`);
       throw new Error("Internal server error")
      } else {
        console.log("Error starting server ", error);
        loger.error("Error starting server ", error);
       throw new Error("Internal server error")
      }
    });
  } catch (error) {
    console.log("Error starting server ", error);
    loger.error("Error starting server ", error);
   throw new Error("Internal server error")
  }
};

startServer();
