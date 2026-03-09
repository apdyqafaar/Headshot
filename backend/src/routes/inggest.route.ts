import { getQueueFunctions } from "@/services/queue/queue.service";
import { Inngest } from "inngest";
import {serve} from "inngest/express"


export const inngestClient=new Inngest({
    id:"headsht-pro",
    name:"Headshot Pro"
})

export const inngestServe=serve({
    client:inngestClient,
    functions:getQueueFunctions()
})