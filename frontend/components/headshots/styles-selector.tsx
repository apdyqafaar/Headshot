"use client"

import { HeadshotStyle, StyleInfo, StyleSelectorProps } from "@/lib"
import { Button } from "../ui/button"
import { Check } from "lucide-react"

const StyleSelector = ({availableStyles,onStylesChange,selectedStyles,maxStyles}:StyleSelectorProps & {availableStyles:StyleInfo[], maxStyles:number}) => {

    const handleToggle=(styleKey:HeadshotStyle)=>{
        if(selectedStyles.includes(styleKey)){
            onStylesChange(selectedStyles.filter(s=>s !== styleKey))
        }else{
            if(selectedStyles.length < maxStyles){
                  onStylesChange([...selectedStyles, styleKey])
            }
          
        }
    }
  return (
    <div className="space-y-4 ">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
                Select Styles ({selectedStyles.length}/{maxStyles})
            </h3>
             </div>
            {
                selectedStyles.length>=maxStyles &&(
                    <p className="text-xs text-muted-foreground">
                        Maximum {maxStyles} styles selected
                    </p>
                )
            }
            <div className="grid gap-3 sm:grid-cols-2">
                {
                    availableStyles.map(style=>{
                        const isSelected=selectedStyles.includes(style.key)
                        const isDisabled=!isSelected && selectedStyles.length>=maxStyles
                        return(
                            <Button
                            variant={"ghost"}
                             key={style.key}
                             onClick={()=>handleToggle(style.key)}
                             disabled={isDisabled}
                             className={` py-8 px-0 relative rounded-lg border  flex  text-left  px-4 justify-start transition-all
                                ${isSelected
                                    ?"border-primary bg-primary/5"
                                    :"bg-background"
                                }
                                ${
                                    isDisabled?"cursor-not-allowed opacity-50":"cursor-pointer"
                                }
                                `}
                            >
                                {
                                    isSelected&&(
                                        <div className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary/70">
                                            <Check className="h-2 w-2 text-primary-foreground"/>
                                        </div>
                                    )
                                }
                                <div className="pr-8">
                                <h4 className=" font-medium text-foreground">{style.name}</h4>
                                <p className="mt-1 text-xs text-muted-foreground">{style.description}</p>
                                </div>
                            </Button>
                        )
                    })
                }
            </div>
            {
                selectedStyles.length===0&&(
                    <p className="text-center text-sm  text-muted-foreground">Selecte at least One to continue</p>
                )
            }
       
    </div>
  )
}

export default StyleSelector