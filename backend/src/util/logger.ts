import winston from "winston";
import path, { format } from "path"
import fs from "fs"
// logs dir
const logsDir=path.join(process.cwd(), "logs")

if(!fs.existsSync(logsDir)){
    fs.mkdirSync(logsDir, {recursive:true})
}


export const loger=winston.createLogger({
    format:winston.format.combine(
        winston.format.timestamp({format:"YYYY-MM-DD HH:mm:ss"}),
        winston.format.errors({stack:true}),
        winston.format.json(),
    ),
    transports:[
        new winston.transports.Console(
            {
                format:winston.format.combine(
                    winston.format.timestamp({format:"YYYY-MM-DD HH:mm:ss"}),
                    winston.format.errors({stack:true}),
                    winston.format.json(),
                    winston.format.printf(({timestamp, level, message,  ...meta})=>{
                        return `
                          ${timestamp} [${level}]: ${message}    ${
                            Object.keys(meta).length>0? JSON.stringify(meta):""
                          }
                        `
                    }))
            }
        ),

        // combined logs file creation
        new winston.transports.File({
            filename:path.join(logsDir, "combined.log"),
            format:winston.format.combine(winston.format.timestamp({format:"YYYY-MM-DD HH:mm:ss"}),
            winston.format.errors({stack:true}),
            winston.format.json(),
        ),
            
        }),

          // combined logs file creation
          new winston.transports.File({
            filename:path.join(logsDir, "error.log"),
            format:winston.format.combine(winston.format.timestamp({format:"YYYY-MM-DD HH:mm:ss"}),
            winston.format.errors({stack:true}),
            winston.format.json(),
        ),
        level:"error"
        })
    ]
})