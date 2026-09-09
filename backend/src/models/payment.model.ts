import mongoose, { Document, Schema } from "mongoose";

export enum PaymentPlan {
  MONTHLY = "monthly",
  SIX_MONTH = "six_month",
}

export enum PaymentStatus {
  CREATED = "created",
  CAPTURED = "captured",
  FAILED = "failed",
}

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: string;
  paymentId: string | null;
  idempotencyKey: string;
  webhookEventId: string | null | string[];
  plan: PaymentPlan;
  amount: number;
  status: PaymentStatus;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index:true
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    paymentId: {
      type: String,
      default: null,
    },

    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
    },

    webhookEventId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },

    plan: {
      type: String,
      enum: Object.values(PaymentPlan),
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.CREATED,
    },
  },
  {
    timestamps: true,
  },
);

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);