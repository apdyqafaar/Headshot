import { config } from "@/config";
import {  appError, ExternalServiceError } from "@/util/errors";
import { loger } from "@/util/logger";
import {  DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl as generateSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "bun";
import { nanoid } from "nanoid";

export interface UploadResult{
    url:string,
    key:string,
    bucket?:string
}
// create the client
const s3Client= new S3Client({
    region:config.aws.region,
    credentials:{
        accessKeyId:config.aws.accessKey,
        secretAccessKey:config.aws.secretKey
    },
    apiVersion:config.aws.version
})


export class S3Service{
    private bucketName:string
    constructor(){
        this.bucketName=config.aws.bucketName
    }

    // upload original to the s3 cloud
    async uploadImages(userId:string, fileBuffer:Buffer, mimeType:string, uploadType:string):Promise<UploadResult>{
        try {
            const extension=mimeType.split("/")[1] ||"jpg"
            const key =`${userId}-${nanoid()}-${uploadType}`

            const command=new PutObjectCommand({
                Bucket:this.bucketName,
                Key:key,
                Body:fileBuffer,
                ContentType:mimeType,
                Metadata:{
                    uploadType,
                    userId,
                    type:mimeType,
                    uploadedAt:new Date().toISOString()
                }
            })

            // sending to the aws-s3
            await s3Client.send(command)
            // then preparing the url
            const url=`https://${this.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`
            loger.info(`Uploaded original photo to s3 cloud`)
            return{
                key,
                url,
                bucket:this.bucketName
            }
        } catch (error) {
            loger.warn("Failed to upload original photo to s3 cloud")
            throw new ExternalServiceError("Failed to upload original photo to s3 cloud")
        }
    }

    // generate Signed URL for the original photo
    async getSignedUrl(key:string, expiresIn:number=3600):Promise<string>{
  try {
    if(!key || key.trim()===""){
        loger.warn("In valid key url")
        throw new appError("In valid key url")
    }
    const command=new GetObjectCommand({
        Bucket:this.bucketName,
        Key:key,
    })
    return await generateSignedUrl(s3Client, command, {expiresIn})
  } catch (error) {
      loger.warn("Failed to generate signed URL key")
        throw new appError("Failed to generate signed URL key")
  }
    }

    // Download image
    async downlaodImageUrl(url:string):Promise<Buffer>{
        try {
            const response=await fetch(url)
            if(!response.ok){
                loger.warn(`Failed to download file image On the api`)
                throw new appError(`Failed to download file image On the api`)
            }
            const arreyBuffer=await response.arrayBuffer()
            return Buffer.from(arreyBuffer)
        } catch (error) {
             loger.warn(`Failed to download file image`)
                throw new appError(`Failed to download file image`)
        }
    }


    // delete file
   private async deleteFile(key:string):Promise<void>{
        if(!key|| !key.trim()){
            throw new appError("Invalid ")
        }

        try {
            const commend=new DeleteObjectCommand({
                 Bucket:this.bucketName,
                Key:key,
            })
            await s3Client.send(commend)
            loger.info(`deleted file ${key} from s3`)

        } catch (error) {
            loger.warn(`Failed to delete this file ${key} on s3 of bucket ${this.bucketName} `)
            throw new appError(`Failed to delete this file ${key} on s3 of bucket ${this.bucketName} `)
        }
    }

    // delete ol key on s3
    async deleteFiles(keys:string[]):Promise<void>{
       const deletePromises=keys.map(k=>this.deleteFile(k))
       loger.info(`Deleted ${keys.length} files from s3 cloud`)
    }
}
export const s3Service=new S3Service()