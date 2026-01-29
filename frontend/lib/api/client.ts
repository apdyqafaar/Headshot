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
  constructor(message:string, public satus:number, public data?:unknown){
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

export const api={
    get:<T=unknown>(endpoint:string, config?:AxiosRequestConfig)=>axiosInstance.get<ApiResponse<T>>(endpoint, config).then((res)=>res.data.data as T),
    post:<T=unknown>(endpoint:string, body?:unknown, config?:AxiosRequestConfig)=>axiosInstance.post<ApiResponse<T>>(endpoint,body, config).then((res)=>res.data.data as T),
    put:<T=unknown>(endpoint:string, body?:unknown, config?:AxiosRequestConfig)=>axiosInstance.put<ApiResponse<T>>(endpoint, body, config).then((res)=>res.data.data as T),
    delete:<T=unknown>(endpoint:string,config?:AxiosRequestConfig)=>axiosInstance.delete<ApiResponse<T>>(endpoint,  config).then((res)=>res.data.data as T),
}

