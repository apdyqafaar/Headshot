"use client"

import HeadshotGallery from "@/components/headshots/headshot-gallery"
import PhotoUpload from "@/components/headshots/photo-upload"
import StyleSelector from "@/components/headshots/styles-selector"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Headshot, HeadshotStyle, useDeleteHeadshots, useGenerateHeadshot, useHeadshots, useHeadshotStyles,  } from "@/lib"
import { useUser } from "@/lib/context"
import { Loader2, SparklesIcon, Upload } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const creditsPage = () => {
  const {user}=useUser()
  const [selectedFile, setSelectedFile]=useState<File | null>(null)
  const [selectedStyles, setSelectedStyles]=useState<HeadshotStyle[]>([])
  const [isUploading, setIsUploading]=useState(false)
  const [customPrompt, setCustomPrompt]=useState<string>("")

  //TenStack query hooks
  const{data:headshotsData,isLoading:isLoadingHeadshots}=useHeadshots({limit:10, offset:0}) 
  const {data:headshotStyle, isLoading:isLoadingStyles}=useHeadshotStyles()
  const {mutate:generateHeadshots, isPending:isGenerationg}=useGenerateHeadshot()
  const {mutate:deleteHeadshot, isPending:isDeleting}=useDeleteHeadshots()

// console.log("headshotStyle ",headshotStyle)


// handle upload
const handleUpload=()=>{
  if(!selectedFile){
    toast.error('Please select a photo')
    return
  }

   if(selectedStyles.length===0 && !customPrompt){
    toast.error('Please select at least one style or write custom prompt')
    return
  }

  generateHeadshots({
    photo:selectedFile,
    styles:selectedStyles,
    prompt:customPrompt.trim()
  },{
    onSuccess:()=>{
      toast.success("Headshot generated successfully")
      setCustomPrompt("")
      setSelectedFile(null)
      setSelectedStyles([])
    },
    onError:(err:any)=>{
      console.log("mutation error",err)
      const msg=err?.response?.data?.message||err.message||'Failed to upload photo'
      toast.error(msg)
    }
  })
}

// hand delete
const handleDelete=(id:string)=>{
   deleteHeadshot(id,{
    onSuccess:()=>   toast.success("Headshot was deleted successfully"),
    onError:()=>   toast.error("Failed to delete Headshot")
   })
}
  return (
    <div>
      {/* header */}
      <div >
        <h1 className="text-2xl font-bold text-foreground">AI Headshots</h1>
        <p className=" text-sm text-muted-foreground">Upload a photo and get professional headshots in different styles</p>
      </div>
      
      {/* upload section */}
      <div className="space-y-6 border border-border my-8 p-6 rounded-md ">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-primary"/>
          <h2 className="text-lg font-semibold  text-foreground">Generate Headshots</h2>
        </div>

      {/* upload photo  */}
        <div>
         <Label className="text-sm text-foreground">Upload your photo</Label>
         <PhotoUpload
          onUploadSuccess={setSelectedFile}
          onUploadError={(error:string)=> toast.error(error)}
         />
        </div>

        {/* select styles */}
        {
          headshotStyle && headshotStyle.length>0?(
              <StyleSelector selectedStyles={selectedStyles} onStylesChange={setSelectedStyles} maxStyles={5} availableStyles={headshotStyle}/>
          ):(
            // skeleton animation
            <>
     <div className="flex flex-col space-y-4">
  {/* Header Skeleton */}
  <div className="h-8 w-48 bg-muted rounded-md animate-pulse"></div>
    
  <div className="grid sm:grid-cols-2 gap-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <div 
        key={index} 
        className="p-2 border border-border rounded-xl bg-background/50"
      >
        {/* The "Claude-look" uses slightly softer pulses */}
        <div className="h-20 w-full bg-muted rounded-lg animate-pulse shadow-sm"></div>
      </div>
    ))}
  </div>
</div>
            </>
    
)
        }

        {/* prompt section */}
        <div className="space-y-2">
          <Label>Custom prompt (Optional)</Label>
          <Textarea
          id="custom-prompt"
          value={customPrompt}
          onChange={(e)=> setCustomPrompt(e.target.value)}
          rows={5}
          placeholder="Enter custom prompt to override the default style prompts. If left empty default prompts will be used"
          />
          <p className="text-center text-xs text-muted-foreground">
           leave empty to use styles prompt, or enter custom prompt to apply to all selected styles
          </p>
        </div>

        {/* button */}
          <Button className="w-full" onClick={handleUpload} disabled={!selectedFile || (selectedStyles.length===0 && !customPrompt.trim())} size={"lg"}>
            {
              isUploading?(
                <>
                <Loader2 className="w-4 h-4 animate-spin"/>
                Uploading...
                </>
              ):(
                <>
                <SparklesIcon className="w-4 h-4"/>
                Generate Headshots
                </>
                
              )
            }
          </Button>
         <p className="text-center text-xs text-muted-foreground">
            Generation takes 2-5 minutes
          </p>
      </div>

      {/* Headshot Gallery */}

      
      <div>
        <h2 className="font-semibold text-lg mb-4 text-foreground">Your Headshots</h2>
        <HeadshotGallery headshots={headshotsData?.headshots ||[]} hasMore={false} isLoading={isLoadingHeadshots} onDelete={handleDelete} isDeletinghHeadshot={isDeleting}/>
      </div>
    </div>
  )
}

export default creditsPage