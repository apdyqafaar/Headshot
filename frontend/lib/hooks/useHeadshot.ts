import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteHeadshot, getHeadshots, getHeadshotStyles, uploadPhoto } from "../services/headshot.service";
import { GetHeadshotsParams, Headshot, UploadPhotoParams } from "../types";

export function useHeadshotStyles(){
    return useQuery({
        queryKey:['headshot-styles'],
        queryFn:()=> getHeadshotStyles(),
        staleTime:1000* 60* 60 * 24,
        retry:1
    })
}

export function useHeadshots(params: GetHeadshotsParams){
    const result=useQuery({
        queryKey:["headshots", params],
        queryFn:()=> getHeadshots(params),
        staleTime:1000 * 10,
        retry:1,
        refetchInterval:(query)=>{
            const data=query.state.data as any
            const hasProcessing=data?.headshots?.some((headshot: Headshot)=>headshot.status==="processing")

            return hasProcessing?5000:false
        }
    })
    return result
}

export function useGenerateHeadshot(){
 const queryClient=useQueryClient()
 return useMutation({
    mutationFn:(params:UploadPhotoParams)=>uploadPhoto(params),
    onSuccess:()=>{
        queryClient.invalidateQueries({queryKey:["headshots"]})
    }
 })
}


export function useDeleteHeadshots(){
    const queryClient=useQueryClient()
    return useMutation({
        mutationFn:(id:string)=>deleteHeadshot(id),
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["headshots"]})
            queryClient.invalidateQueries({queryKey:["headshots"]})
        }
    })
}