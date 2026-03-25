"use client"

import { PhotoUploadProps } from "@/lib"
import { ChangeEvent, useRef, useState } from "react"
import { Input } from "../ui/input"
import { Upload, X } from "lucide-react"
import { Button } from "../ui/button"

const PhotoUpload = ({onUploadError,onUploadSuccess}:PhotoUploadProps) => {
    const [selectedFile, setSelectedFile]=useState<File| null>(null)
    const [isDragging, setIsDragging]=useState(false)
    const [preview, setPreview]=useState<string | null>(null)
    const fileInputRef=useRef<HTMLInputElement>(null)

    const handleFileSelect=(file:File)=>{
        if(!file.type.startsWith('image/')){
            onUploadError?.("Please select image file");
            return
        }
        if(file.size> 10 * 1024 * 1024){
            onUploadError?.("File size mus be less then 10MB");
            return
        }
        setSelectedFile(file)

        // preparing preview
        const reader=new FileReader();
        reader.onloadend=()=>{
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Notify that file uploaded successfully
        if(onUploadSuccess){
            onUploadSuccess(file as any)
        }
    }
    

    // input change handler
    const handleFileInputChange=(e:ChangeEvent<HTMLInputElement>)=>{
        e.preventDefault()
        const file=e.target.files?.[0]
        if(file){
            handleFileSelect(file)
        }
    }



    // drag and drop functions
    const handleClick=()=>{
        fileInputRef.current?.click()
    }

     const handleDrop=(e:React.DragEvent<HTMLDivElement>)=>{
        e.preventDefault()
        setIsDragging(false)
        
        const file=e.dataTransfer.files?.[0]
        if(file){
            setSelectedFile(file)
        }
     }

    const handleDragLeave=()=>{
        setIsDragging(false)
    }

    const handleDragOver=(e:React.DragEvent<HTMLDivElement>)=>{
        e.preventDefault()
        setIsDragging(true)
    }

    const handleRemove=()=>{
        setSelectedFile(null)
        setIsDragging(false)
        setPreview(null)
        if(fileInputRef.current){
            fileInputRef.current.value=""
        }
    }
  return (
    <div className="space-y-4 my-2">
        <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        />
        {
            !preview?(
                <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragLeave}
                className={`relative cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                    isDragging?"border-primary bg-primary/5":"border-border hover:border-primary hover:bg-accent"
                }`}
                >
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground"/>
                    <p className="mt-4 text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                     <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, or WEBP (max 100MB)</p>
                </div>
            ):(
                <div className="relative rounded-lg border border-border bg-card p-4">
                    <Button
                    onClick={handleRemove}
                    variant={"ghost"}
                    size={"icon"}
                    className="absolute right-2 top-2 rounded-full shadow-md"
                    >
                        <X className="w-4 h-4"/>
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md">
                            <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            )
        }
    </div>
  )
}

export default PhotoUpload