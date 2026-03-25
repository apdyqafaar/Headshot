import { Headshot } from "@/models";
import { inngestClient } from "@/routes/inggest.route";
import {  headshotService, HeadshotStyles } from "@/services/headshot";
import { s3Service } from "@/services/s3";
import { appError } from "@/util/errors";
import { loger } from "@/util/logger";
import { NonRetriableError } from "inngest";

export interface GenerateHeadshotEventData{
    headshotId:string,
    userId:string,
    originalPhotoUrl:string,
    styles:HeadshotStyles[],
    customPrompt?:string
}
export function getGenerateHeadshotFunction(){
    return inngestClient.createFunction(
        {
            id:"generate/headshot",
            name:"Generate Headshot",
            retries:3
        },
        {
            event:"headshot/generate"
        },

        async({event, step})=>{
           const {headshotId,originalPhotoUrl,styles,userId,customPrompt}=event.data as GenerateHeadshotEventData

           loger.info(`Generation headshot started for ${headshotId}`, event.data)

        
            try {
              //    step 1 update headshot document to processing
              await step.run("update-headhot-document-processing",async()=>{
                const headshot=await Headshot.findById(headshotId)
                if(!headshot){
                    loger.warn("Headshot document was not found")
                    throw new NonRetriableError("Headshot document was not found")
                }
                headshot.status==="processing"
                headshot.processingStartedAt=new Date()
                await headshot.save()
                loger.info(` headshot document was updated ${headshotId}`)
              }) 


            //   step 2 Generate the headshots for each style
            const generateHeadshot=await step.run("generate-headshots", async()=>{

                if(customPrompt && styles.length===0){
                     loger.info(`Processing with using custom prompt: ${customPrompt||""}`)
                      const result=await headshotService.generateHeadshot({
                            imageUrl:originalPhotoUrl,
                            style:null,
                            customPrompt
                          })
                            return[{
                            style:customPrompt,
                            status:"succeeded",
                            imageUrl:result.imageUrl,
                            key:result.imageUrl || `${headshotId}-${customPrompt}.png`
                          }]
                }

               

                // validate the styles
                if(!Array.isArray(styles)){
                    throw new appError("Styles must be an array", 400)
                }

                const stylesArray=styles 
                if(stylesArray.length===0 && !customPrompt?.trim()){
                       throw new appError("At least one style or prompt is required", 400)
                }
                loger.info(`Processing ${styles.length} styles and ${customPrompt||""}`)

                // then promise all styles to gather
                const results=await Promise.all(stylesArray.map(async(style)=>{
                    try {
                          loger.info(`Processing style ${style}`)
                          
                          const result=await headshotService.generateHeadshot({
                            imageUrl:originalPhotoUrl,
                            style
                          })
                          loger.info(`Style ${style} processed successfully`, {result})
                          return{
                            style,
                            status:"succeeded",
                            imageUrl:result.imageUrl,
                            key:result.imageUrl || `${headshotId}-${style}.png`
                          }
                    } catch (error :any) {
                        loger.error(`Failed to process style ${style}`, {message: error?.message, style,error})
                        return{
                            style,
                            status:"failed",
                            imageUrl:null,
                            key:null
                        }
                    }
                }))

                return results
            })

            // step 3 upload generated image to s3
             const uploadHeadshots=await step.run("upload-to-s3", async()=>{
                const succeedHeadshots=generateHeadshot.filter(headshot=>headshot.status==="succeeded")     
                 
                // promise all
                const uploads=await Promise.all(succeedHeadshots.map(async(headshot)=>{
                    try {

                        // first download the image on replicate
                        const imageBuffer=await s3Service.downlaodImageUrl(headshot.imageUrl as string)

                        loger.info("Downloaded image the uploading to the s3")
                        const uploadedImage=await s3Service.uploadImages(userId, imageBuffer, "image/png", "Generated")
                        
                        loger.info("Uploaded headshot to s3 cloud", headshot.style)
                        return{
                            style:headshot.style,
                            key:uploadedImage.key,
                            url:uploadedImage.url
                        }
                        
                    } catch (error) {
                         loger.info("Failed to uploaded headshots to s3 cloud")
                         return null
                    }
                }))
                  loger.info(`Uploaded ${uploads.length} headshots to s3 cloud ${uploads}`)
               return uploads.filter((up)=>up !== null) 
             })
              
            //  step 3 update the headshot document
             await step.run("update-status-completed", async()=>{
                if(generateHeadshot.length===0){
                    const failedStyles=generateHeadshot.filter((he :any)=> he.status==="failed")
                    .map(he=>({style:he.style, error:"Failed to generate this headshot"}))

                    await Headshot.findByIdAndUpdate(headshotId,{
                        status:"failed",
                        failureReason:`All headshot generation `,
                        processingCompletedAt:new Date(),
                    });
                    loger.info(`Updated headshots documant to failed for headshot ${headshotId} with failer reason ${failedStyles.map(f=>`${f.style}: ${f.error}`).join(',')}`)
                    throw new appError(`All headshot styles generation failed`)
                }


                  await Headshot.findByIdAndUpdate(headshotId,{
                        status:"completed",
                        generatedHeadshots:uploadHeadshots.map(h=>({
                            style:h.style,
                            url:h.url,
                            key:h.key,
                            createdAt:new Date()
                        })),
                        processingCompletedAt:new Date(),
                    });
                      loger.info(`Updated headshots documant to completed for headshot ${headshotId} with ${uploadHeadshots.length} generated styles`)
                    
                      return{
                        success:true,
                        headshotId,
                        generatedCount:uploadHeadshots.length
                      }
             })
            } catch (error) {
               loger.error("Failed to generate headshot", {message: error instanceof Error ? error.message :"UNKNOWN ERROR", error})
               await step.run("update-status-failed", async()=>{
                   await Headshot.findByIdAndUpdate(headshotId,{
                        status:"failed",
                        failureReason:error instanceof Error ? error.message :"UNKNOWN ERROR" ,
                        processingCompletedAt:new Date(),
                    });
               })
               throw new appError("Failed to generate headshot") 
            }
        }
    )
}