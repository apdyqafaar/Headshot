import mongoose, { Document, Schema } from "mongoose";

export interface ICreditPackage extends Document {
  name: string;
  credits: number;
  price: number;
  description?: string;
  isActive: boolean;
  stripePriceId?: string;
  bonus?: number;
  popular?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const creditPackageSchema = new Schema<ICreditPackage>(
  {
    name: { type: String, required: true, trim: true },
    credits: { type: Number, min: 1, required: true },
    price: { type: Number, min: 0, required: true },
    description: { type: String, trim: true  },
    isActive: { type: Boolean, default: true, index: true },
    stripePriceId: { type: String, unique: true, sparse: true },
    bonus: { type: Number, default: 0, min: 0 },
    popular: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// index to optimize queries for active packages sorted by price
creditPackageSchema.index({ isActive: 1, price: 1 });

export const CreditsPackage = mongoose.model<ICreditPackage>("CreditsPackage", creditPackageSchema);
