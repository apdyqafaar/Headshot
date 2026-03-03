import axios ,{AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";

// base url
const API_BASE_URL=process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

// interface
export interface ApiResponse<T=unknown>{
    success:boolean,
    message:string,
    data?:T,
    error?:string
}

export class ApiError extends Error{
  constructor(message:string, public status:number, public data?:unknown){
    super(message)
    this.name="ApiError"
  }
}

const axiosInstance=axios.create({
    baseURL:API_BASE_URL,
    withCredentials:true,
    headers:{
        "Content-Type":"application/json"
    }
})


const REFRESH_FAILED_KEY="REFRESH_FAILED_KEY"
// CHECK if refresh key exists
const hasRefreshFailedKey=()=>{
    if(typeof window ==="undefined") return false;
    return sessionStorage.getItem(REFRESH_FAILED_KEY)==="true"
}
const setRefreshFailedKey=()=>{
    if(typeof window ==="undefined") return false;
    return sessionStorage.setItem(REFRESH_FAILED_KEY,"true")
}
const resetRefreshFailedKey=()=>{
    if(typeof window ==="undefined") return false;
    return sessionStorage.removeItem(REFRESH_FAILED_KEY)
}


if(typeof window !=="undefined"){
    resetRefreshFailedKey()
}


// interceptors
axiosInstance.interceptors.response.use(

    // success response
    (response:AxiosResponse<ApiResponse>)=>{
    return response
    },

    // error response
    async(err:AxiosError<ApiResponse>)=>{
    const originalRequest=err.config  as any


    if(err.response?.status !== 401){
        if(err.response){
         const {data, status}=err.response
      
         throw new ApiError(data?.message || "An error occurred", status)
        }

              
         throw new ApiError(err?.message || "Network error", 0, err)
    }
    
    const isRefreshingEndPOint=originalRequest?.url?.includes("/auth/refresh-token")
    if(isRefreshingEndPOint || originalRequest._retry || hasRefreshFailedKey()){
        return Promise.reject(err)
    }
     
        originalRequest._retry=true

        try {
            await axiosInstance.post("/auth/refresh-token",{},{
                withCredentials:true
            })

            return axiosInstance(originalRequest)
        } catch (error) {
            setRefreshFailedKey()
                return Promise.reject(err)      
            }
        }
    
  

)

export const api={
    get:<T=unknown>(endpoint:string, config?:AxiosRequestConfig)=>axiosInstance.get<ApiResponse<T>>(endpoint, config).then((res)=>res.data.data as T),
    post:<T=unknown>(endpoint:string, body?:unknown, config?:AxiosRequestConfig)=>axiosInstance.post<ApiResponse<T>>(endpoint,body, config).then((res)=>res.data.data as T),
    put:<T=unknown>(endpoint:string, body?:unknown, config?:AxiosRequestConfig)=>axiosInstance.put<ApiResponse<T>>(endpoint, body, config).then((res)=>res.data.data as T),
    delete:<T=unknown>(endpoint:string,config?:AxiosRequestConfig)=>axiosInstance.delete<ApiResponse<T>>(endpoint,  config).then((res)=>res.data.data as T),
}

