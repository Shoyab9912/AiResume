import mongoose, { Document, Schema } from "mongoose";

export enum PaymentPlan {
  MONTHLY = "monthly",
  SIXMONTH = "sixmonth",
}

export enum PaymentStatus {
  INITIATING = "initiating",
  CREATED = "created",
  CAPTURED = "captured",
  FAILED = "failed",
}

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: string | null;
  paymentId: string | null;
  idempotencyKey: string;
  plan: PaymentPlan;
  amount: number;
  currency: string;
  status: PaymentStatus;
  lockUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      default: null,
    },
    paymentId: {
      type: String,
      default: null,
    },
    idempotencyKey: {
      type: String,
      required: true,
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
    currency: {
      type: String,
      default: "INR",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.INITIATING,
      required: true,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });


paymentSchema.index(
  { orderId: 1 },
  { unique: true, partialFilterExpression: { orderId: { $type: "string" } } }
);

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);