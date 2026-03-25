import { Headshot, User } from "@/models";
import { headshotService, HeadshotStyles, triggerHeadshotGeneration } from "@/services";
import { s3Service } from "@/services/s3";
import {
  appError,
  InsufficientCreditsError,
  NotFoundError,
} from "@/util/errors";
import { loger } from "@/util/logger";
import { createdResponse, successResponse } from "@/util/response";
import { Response, Request } from "express";
import mongoose from "mongoose";

export const getAvailableStyles = async (req: Request, res: Response) => {
  const availableStyles = headshotService.getAvailableStyles();
  return successResponse(
    res,
    availableStyles,
    "Available styles fetched successfully",
  );
};

export const generateHeadshot = async (req: Request, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.user?.userId);
  const styles = (req.body.styles || []) as HeadshotStyles[]
  const customPrompt = req.body.prompt as string | undefined;
  const file = req.file;
  if (!file) throw new appError("No file uploaded", 400);
  const creditsNeeded = styles.length + (customPrompt ? 1 : 0);
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");
  if (user.credits < creditsNeeded) {
    throw new InsufficientCreditsError(
      "Insufficient credits for the generation",
    );
  }

  // deduct the credits from th user
  user.credits -= creditsNeeded;
  await user.save();

  loger.info(`Deducted ${creditsNeeded} credits from the user ${userId}`);
  
  try {
    
    // upload the file to the cloud
    const uploadResult=await s3Service.uploadImages(userId.toString(), file.buffer, file.mimetype, "Originals")
    // generate signed url
    const signedUrl=await s3Service.getSignedUrl(uploadResult.key)
    loger.info(`Uploaded original photo and generated signed URL for user ${userId}`);

    // create headshot document
    const headshot=await Headshot.create({
      userId,
      originalPhotoUrl:signedUrl,
      originalPhotoKey:uploadResult.key,
      status:"processing",
      selectedStyles:styles
    })
    loger.info(`Created headshot document with id ${headshot._id} for user ${userId}`);
    
    // enqueue the headshot generation
    await triggerHeadshotGeneration({
      headshotId:headshot._id.toString(),
      userId:userId.toString(),
      originalPhotoUrl:signedUrl,
      styles,
      customPrompt
    })

    
  loger.info(`Headshot generation triggered for headshot ${headshot._id} with ${styles.length} styles and ${(customPrompt||"no custom prompt")}`);
  return createdResponse(res, "Headshot generation started successfully")

  } catch (error) {
    loger.warn(`Failed to generate headshot for user ${userId}: ${error instanceof Error ? error.message : "Unknown error"}`);
    throw new appError("Failed to generate headshot", 500);
  }
};

export const getHeadshots=async(req: Request, res: Response)=>{
 const userId=new mongoose.Types.ObjectId(req.user?.userId)
 const {status, limit, offset}=req.query

 const query:any={
  userId
 }
 if(status){
  query.status=status
 }

 const headshots=await Headshot.find(query)
 .limit(Number(limit))
 .skip(Number(offset))
 .sort({createdAt:-1})
 .select('-__v')

 const total=await Headshot.countDocuments(query)   

//  generate signed url for headshots

  const headshotsWithSignedUrl=await Promise.all(
    headshots.map(async(headhsot)=>{

      const headshotObj= headhsot.toObject()
        
      // generate signed url for original photos
      const originalSignedUrl=await s3Service.getSignedUrl(headshotObj.originalPhotoKey, 86400)

      // generate signed url for generated headshots
      const generatedHeadshotSignedUrl= await Promise.all(
        headshotObj.generatedHeadshots.map(async(g)=>{
          if(!g.key){
            loger.warn(`Generated headshot key is missing ${headshotObj._id}`)
            return{
              ...g,
              url:g.url ||""
            }
          }


          return{
            ...g,
            url:await s3Service.getSignedUrl(g.key, 86400)
          }
        })
      )

      return{
        ...headshotObj,
        originalPhotoUrl:originalSignedUrl,
        generatedHeadshots:generatedHeadshotSignedUrl
      }
    })

  )

  return successResponse(res,{
    headshots:headshotsWithSignedUrl,
    pagination:{
      total,
      limit:Number(limit),
      offset:Number(offset),
      hasMore:Number(offset)+Number(limit)<total
    }
  }, "Headshots fetched successfully")
}

export const deleteHeadshot=async(req: Request, res: Response)=>{
  const userId=new mongoose.Types.ObjectId(req.user?.userId)
  const {id}=req.params

  try {
    const headshot=await Headshot.findOne({_id:id, userId})
    if(!headshot) throw new NotFoundError("Headshot not found")

      // get all keys to delete on s3
      const keysToDelete=[
        headshot.originalPhotoKey,
        ...headshot.generatedHeadshots.map(g=>g.key)
      ]
      await s3Service.deleteFiles(keysToDelete)
      await Headshot.findByIdAndDelete(id)

      loger.info("Original and generated headshots were deleted all form Document DB and s3 cloud")

      return successResponse(res, "*", "Images were deleted successfully")
  } catch (error) {
    loger.warn("Failed to run delete on controller: ", error)
    throw new appError("Failed to run delete on controller")
  }

}