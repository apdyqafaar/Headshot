import { inngestClient } from "@/routes/inggest.route";
import { appError } from "@/util/errors";
import { loger } from "@/util/logger";
import { Inngest } from "inngest";
import { getCreditAdditionFunction, ICreditAdditionData } from "./events";

export const getClient=():Inngest=>{
  return inngestClient
}

export function getQueueFunctions(){
    return [
        getCreditAdditionFunction()
    ]
}

// trigger add credits user event
export async function triggerCreditAddition(data:ICreditAdditionData):Promise<void>{
    try {
        await inngestClient.send({
            name:"payment/credits-add",
            data
        })
    } catch (error) {
        loger.warn(`Failed to credit addition for user: ${data.userId}`)
        throw new appError("Failed to credit addition for user", 500)
    }
}