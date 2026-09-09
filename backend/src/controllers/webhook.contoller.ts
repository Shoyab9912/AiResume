import mongoose from "mongoose";
import { Payment, PaymentStatus } from "../models/payment.model.js";
import { User } from "../models/user.model.js";
import { PAYMENT_PLANS } from "../config/plans.js";
import asyncHandler from "../utils/asyncHandler.js";
import Razorpay from "razorpay";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../utils/errors.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const handleRazorpayWebhook = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const signatureHeader = req.headers["x-razorpay-signature"];
    const eventIdHeader = req.headers["x-razorpay-event-id"];

  
    if (!signatureHeader || Array.isArray(signatureHeader)) {
      throw new BadRequestError("Missing or invalid webhook signature.");
    }
    const signature: string = signatureHeader;

    if (!eventIdHeader || Array.isArray(eventIdHeader)) {
      throw new BadRequestError("Missing or invalid webhook event id.");
    }
    const eventId: string = eventIdHeader;

    const isSignatureValid = Razorpay.validateWebhookSignature(
      JSON.stringify(req.body),
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET!,
    );

    if (!isSignatureValid) {
      throw new BadRequestError("Invalid webhook signature.");
    }

    const event = req.body;

    if (
      event.event !== "payment.captured" &&
      event.event !== "payment.failed"
    ) {
      return res.status(200).json(new ApiResponse(200, "", {
        message: "Event ignored",
      }));
    }

    const razorpayPayment = event.payload?.payment?.entity;

    const dbSession = await mongoose.startSession();

    try {
      await dbSession.withTransaction(async () => {
        const payment = await Payment.findOne({
          orderId: razorpayPayment.order_id,
        }).session(dbSession);

        if (!payment) {
          return;
        }

        if (payment.webhookEventId === eventId) {
          return;
        }

        if (event.event === "payment.failed") {
          payment.status = PaymentStatus.FAILED;
          payment.webhookEventId = eventId;

          await payment.save({ session: dbSession });

          return;
        }

        if (payment.status === PaymentStatus.CAPTURED) {
          payment.webhookEventId = eventId;
          await payment.save({ session: dbSession });

          return;
        }

        if (razorpayPayment.amount !== payment.amount) {
          throw new ConflictError("Payment amount mismatch");
        }

        const user = await User.findById(payment.userId).session(dbSession);

        if (!user) {
          throw new NotFoundError("User not found");
        }

        if (user.hasProAcess()) {
          throw new ConflictError("User already has an active subscription");
        }

        const plan = PAYMENT_PLANS[payment.plan];

        user.subscription = new Date(
          Date.now() + plan.durationDays * 24 * 60 * 60 * 1000,
        );

        payment.paymentId = razorpayPayment.id;
        payment.status = PaymentStatus.CAPTURED;
        payment.webhookEventId = eventId;

        await user.save({ session: dbSession });
        await payment.save({ session: dbSession });
      });
    } finally {
      await dbSession.endSession();
    }

    return res.status(200).json(new ApiResponse(200, "", {
      message: "Webhook processed",
    }));
  },
);