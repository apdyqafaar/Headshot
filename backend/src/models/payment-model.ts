import { PaymentPlatform, PaymentStatus } from "@/types/payment-types";
import mongoose, { Document,Schema } from "mongoose";

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  package: mongoose.Types.ObjectId;
  platform: PaymentPlatform;
  phone?: string;
  status: PaymentStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  transactionId?: string;
  paymentDetails?: any;
  creditsAdded?: boolean;
  credits?: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new mongoose.Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    package: { type: Schema.Types.ObjectId, ref: "CreditsPackage", required: true },
    platform: {
      type: String,
      enum: Object.values(PaymentPlatform),
      required: true,
    },
    phone: {
       type: String, 
       required: function(this:IOrder) { return this.platform === PaymentPlatform.LOCAL; }
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    stripeSessionId: { type: String, sparse: true, index: true },
    stripePaymentIntentId: { type: String, sparse: true, index: true },
    transactionId: { type: String, sparse: true, index: true },
    paymentDetails: { type:Schema.Types.Mixed },
    creditsAdded: { type: Boolean, default: false },
    credits: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

// compound index to optimize queries by user and status
OrderSchema.index({ user: 1, status: 1 });
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ user: 1, creditsAdded: 1 });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
