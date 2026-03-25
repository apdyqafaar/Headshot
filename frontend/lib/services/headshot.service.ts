import { api } from "../api"
import { GetHeadshotsParams, GetHeadshotsResponse, GetStylesResponse, Headshot, StyleInfo, UploadPhotoParams, UploadPhotoResponse } from "../types"


export const getHeadshotStyles= async():Promise<StyleInfo[]>=>{
  return api.get<StyleInfo[]>("/headshot/styles")
}

// upload 
export const uploadPhoto=async(params:UploadPhotoParams):Promise<UploadPhotoResponse>=>{
    const formData=new FormData()
    formData.append('photo',params.photo)
    formData.append('styles',JSON.stringify(params.styles))
    if(params.prompt){
        formData.append("prompt", params.prompt)
    }
    return api.post<UploadPhotoResponse>("/headshot/generate", formData, 
        {
            headers:{
                 "Content-Type":"multipart/form-data"
            }
        }
    )
}
// get single headshot by id
export const getHeadshots = async (params?:GetHeadshotsParams): Promise<GetHeadshotsResponse> => {
    return api.get<GetHeadshotsResponse>(`/headshot`,{
        params
    })
}

// delete 

// get single headshot by id
export const getHeadshotById = async (id: string): Promise<Headshot> => {
    return api.get<Headshot>(`/headshot/${id}`)
}

// delete headshot
export const deleteHeadshot = async (id: string): Promise<void> => {
    return api.delete(`/headshot/delete/${id}`)
}