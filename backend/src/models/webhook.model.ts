import mongoose, { Document, Schema } from "mongoose";

export interface IWebhookEvent extends Document {
  eventId: string;
  eventType: string;
  orderId: string;
  paymentId: string | null;
  processedAt: Date;
}

const webhookEventSchema = new Schema<IWebhookEvent>({
  eventId: {
    type: String,
    required: true,
    unique: true,
  },
  eventType: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
    default: null,
  },
  processedAt: {
    type: Date,
    default: Date.now,
    expires: "90d",
  },
});

export const WebhookEvent = mongoose.model<IWebhookEvent>(
  "WebhookEvent",
  webhookEventSchema
);