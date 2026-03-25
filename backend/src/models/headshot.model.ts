import e from "express";
import mongoose, { Document,Schema } from "mongoose";

export interface IHeadshot extends Document {
  userId: mongoose.Types.ObjectId;
  originalPhotoUrl: string;
  originalPhotoKey: string;
  status: "processing" | "completed" | "failed";
  generatedHeadshots: Array<{
    url: string;
    key: string;
    style: string;
    createdAt: Date;
  }>;
  selectedStyles: string[];
  failureReason?: string;
  processingStartedAt: Date;
  processingCompletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const headshotSchema = new Schema<IHeadshot>({
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: [true, "User is required"], index: true },
  originalPhotoUrl: { type: String, required: [true, "Original photo URL is required"] },
  originalPhotoKey: { type: String, required: [true, "Original photo key is required"] },
  status: {
    type: String,
    enum: ["processing", "completed", "failed"],
    default: "processing",
    index:true,
  },
  generatedHeadshots: [
    {
      url: { type: String, required: [true, "URL is required"] },
      key: { type: String, required: [true, "Key is required"] },
      style: { type: String, required: [true, "Style is required"] },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  selectedStyles: [{ type: String, required:true, default: [] }],
  failureReason: { type: String },
  processingStartedAt: { type: Date },
  processingCompletedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

headshotSchema.index({ userId: 1, createdAt: -1 });
headshotSchema.index({ userId: 1, status: 1 });

export const Headshot = mongoose.model<IHeadshot>("Headshot", headshotSchema);