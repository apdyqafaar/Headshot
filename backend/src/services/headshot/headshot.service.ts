import { config } from "@/config";
import { appError } from "@/util/errors";
import { loger } from "@/util/logger";
import Replicate from "replicate";

export const HEADSHOT_STYLES = {
  professional: {
    key: "professional",
    name: "Professional",
    description:
      "Clean and polished corporate headshot with neutral background.",
    prompt:
      "professional corporate headshot, neutral background, soft studio lighting, sharp focus, business attire, confident expression, high quality portrait photography",
  },

  casual: {
    key: "casual",
    name: "Casual",
    description: "Relaxed and friendly headshot with natural lighting.",
    prompt:
      "casual headshot portrait, natural light, relaxed smile, everyday clothing, soft background blur, approachable and authentic look",
  },

  linkedin: {
    key: "linkedin",
    name: "LinkedIn",
    description: "Optimized for LinkedIn profile with professional lighting.",
    prompt:
      "linkedin profile headshot, professional lighting, plain background, business casual outfit, friendly confident expression, high resolution portrait",
  },

  creative: {
    key: "creative",
    name: "Creative",
    description: "Artistic headshot with unique lighting and expressive mood.",
    prompt:
      "creative portrait headshot, dramatic lighting, colorful or textured background, artistic style, expressive pose, modern photography",
  },

  executive: {
    key: "executive",
    name: "Executive",
    description: "Premium leadership style portrait for executives.",
    prompt:
      "executive business portrait, luxury office background, confident leadership pose, formal suit, cinematic lighting, high-end corporate photography",
  },

  studio: {
    key: "studio",
    name: "Studio",
    description: "Classic studio portrait with controlled lighting.",
    prompt:
      "studio portrait headshot, professional studio lighting setup, plain backdrop, high detail skin tones, crisp and polished photography",
  },
} as const;
export type HeadshotStyles = keyof typeof HEADSHOT_STYLES;

interface GenerateHeadshotParams{
  style: any ,
  customPrompt?:string,
  imageUrl:string,
}
interface GenerateHeadshotResult{
  style: HeadshotStyles,
  imageUrl:string,
}

export class HeadshotService {

  private replicateClient:Replicate

  constructor(){
    this.replicateClient=new Replicate({
      auth:config.replicate.apiKey
    })
  }

  getAvailableStyles(): Array<{
    key: HeadshotStyles;
    name: string;
    description: string;
  }> {
    return (Object.keys(HEADSHOT_STYLES) as HeadshotStyles[]).map((key) => ({
      key,
      name: HEADSHOT_STYLES[key].name,
      description: HEADSHOT_STYLES[key].description,
    }));
  }

  async generateHeadshot({imageUrl, style, customPrompt}:GenerateHeadshotParams):Promise<GenerateHeadshotResult>{
      try {
        const styleConfig=HEADSHOT_STYLES[style as HeadshotStyles]
        
        // configer the prompt
        const prompt=customPrompt?.trim() || styleConfig.prompt.trim()

        let startTime=Date.now()

        // prepare the replicate payload
        const inputParams={
          prompt,
          image_input:[imageUrl],
          resolution:'1K',
          "aspect_ratio":"1:1",
          output_format:"png",
          safety_filters:"block_only_high",
        }
        loger.info(`Sending request to replicate for style ${style}`,{inputParams})

        const output=await this.replicateClient.run("google/nano-banana-pro",{input:inputParams})
        let GenerationTimeEnded=Date.now()
        const url=(output as any).url() 

        if(!url){
          loger.error("No url returned from replicate", {output})
          throw new appError("Failed to generate headshot", 500)
        }

        return{
          imageUrl:url,
          style
        }
      } catch (error : any) {
       const promptError=customPrompt?.trim()|| HEADSHOT_STYLES[style as HeadshotStyles].prompt.trim()
       loger.error("Failed to generate headshot", {error: error.message, style, prompt:promptError})

       if(error?.message?.includes('Invalid') ||error?.code==="E006"){
        throw new appError("The provided image is not valid or does not meet the requirements. Please try with a different image.", 400)
       }
        throw new appError("Failed to generate headshot", 500)
      }
  }
}

export const headshotService = new HeadshotService();
