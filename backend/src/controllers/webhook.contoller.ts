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
import { WebhookEvent } from "../models/webhook.model.js";

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

    const rawBody = (req.body as Buffer).toString("utf8");
    if (
      !Razorpay.validateWebhookSignature(
        rawBody,
        signature,
        process.env.RAZORPAY_WEBHOOK_SECRET!,
      )
    ) {
      throw new BadRequestError("Invalid webhook signature.");
    }
    const event = JSON.parse(rawBody);

    if (
      event.event !== "payment.captured" &&
      event.event !== "payment.failed"
    ) {
      return res.status(200).json(
        new ApiResponse(200, "", {
          message: "Event ignored",
        }),
      );
    }

    const razorpayPayment = event.payload?.payment?.entity;
    const orderId: string | undefined = razorpayPayment?.order_id;
    const paymentId: string | undefined = razorpayPayment?.id;

    if (!orderId || !paymentId) {
      throw new BadRequestError(
        "Invalid webhook payload: missing order_id or id",
      );
    }

    const dbSession = await mongoose.startSession();

    try {
      await dbSession.withTransaction(async () => {
        const alreadyProcessed = await WebhookEvent.findOne({
          eventId,
        }).session(dbSession);

        if (alreadyProcessed) {
          return;
        }

        const payment = await Payment.findOne({ orderId }).session(dbSession);

        if (!payment) {
          throw new NotFoundError(
            `Payment record for order ${orderId} not found yet`,
          );
        }

        await WebhookEvent.create(
          [
            {
              eventId,
              eventType: event.event,
              orderId,
              paymentId,
              processedAt: new Date(),
            },
          ],
          { session: dbSession },
        );

        if (event.event === "payment.failed") {
          await Payment.updateOne(
            {
              _id: payment._id,
              status: {
                $in: [PaymentStatus.INITIATING, PaymentStatus.CREATED],
              },
            },
            {
              $set: { status: PaymentStatus.FAILED },
            },
            { session: dbSession, runValidators: true, },
          );
          return;
        }

        if (
          Number(razorpayPayment.amount) !== Number(payment.amount) ||
          razorpayPayment.currency !== payment.currency
        ) {
          throw new ConflictError("Payment amount or currency mismatch");
        }

        const capturedPayment = await Payment.findOneAndUpdate(
          {
            _id: payment._id,
            status: { $ne: PaymentStatus.CAPTURED },
          },
          {
            $set: {
              status: PaymentStatus.CAPTURED,
              paymentId,
            },
          },
          { returnDocument: "after", session: dbSession, runValidators: true, },
        );

        if (!capturedPayment) {
          return;
        }

        const plan = PAYMENT_PLANS[payment.plan];
        const durationMs = plan.durationDays * 24 * 60 * 60 * 1000;

        const updatedUser = await User.findOneAndUpdate(
          { _id: payment.userId },
          [
            {
              $set: {
                subscription: {
                  $add: [
                    {
                      $cond: [
                        { $gt: ["$subscription", "$$NOW"] },
                        "$subscription",
                        "$$NOW",
                      ],
                    },
                    durationMs,
                  ],
                },
              },
            },
          ],
          { returnDocument: "after", session: dbSession,updatePipeline:true, runValidators: true,},
        );

        if (!updatedUser) {
          throw new NotFoundError("User not found");
        }
      });
    } catch (error: unknown) {
      const mongoError = error as {
        code?: number;
      };

      if (mongoError.code === 11000) {
        return res.status(200).json(
          new ApiResponse(200, "", {
            message: "Webhook already processed",
          }),
        );
      }

      throw error;
    } finally {
      await dbSession.endSession();
    }

    return res.status(200).json(
      new ApiResponse(200, "", {
        message: "Webhook processed",
      }),
    );
  },
);