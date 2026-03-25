import { inngestClient } from "@/routes/inggest.route";
import { appError } from "@/util/errors";
import { loger } from "@/util/logger";
import { Inngest } from "inngest";
import { GenerateHeadshotEventData, getCreditAdditionFunction, getGenerateHeadshotFunction, ICreditAdditionData } from "./events";

export const getClient=():Inngest=>{
  return inngestClient
}

export function getQueueFunctions(){
    return [
        getCreditAdditionFunction(),
        getGenerateHeadshotFunction(),
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

// trigger add headshot generation
export async function triggerHeadshotGeneration(data:GenerateHeadshotEventData):Promise<void>{
    try {
        await inngestClient.send({
            name:"headshot/generate",
            data
        })
    } catch (error) {
        loger.warn(`Failed to trigger headshot generation: ${data.userId}`)
        throw new appError("Failed to trigger headshot generation", 500)
    }
}