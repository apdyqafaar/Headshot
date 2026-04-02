import winston from "winston";
import path, { format } from "path"
import fs from "fs"
import chalk, { ChalkInstance } from "chalk";
// logs dir
const logsDir=path.join(process.cwd(), "logs")
const colors = {
  info: chalk.cyan.bold,
  error: chalk.red.bold,
  warn: chalk.yellow.bold,
  debug: chalk.magenta,
  timestamp: chalk.gray,
  label: chalk.blueBright.bold
};

const levels: Record<string, ChalkInstance> = {
  error: chalk.red.bold,
  warn: chalk.yellow.bold,
  info: chalk.hex('#FFBF00').bold, // Your Amber/Gold
  debug: chalk.blueBright,
};
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
                        const color = levels[level] || chalk.white;
          const label = color(` ${level.toUpperCase()} `);
          const time = chalk.gray(`[${timestamp}]`);
                       const metaData = Object.keys(meta).length 
            ? `\n${chalk.gray(JSON.stringify(meta, null, 2))}` 
            : "";

          // Returns a clean, one-line styled log (plus meta if exists)
          return `${time}${label} ${chalk.whiteBright(message)}${metaData}`;
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