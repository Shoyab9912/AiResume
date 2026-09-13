import Razorpay from "razorpay";

import {
  Payment,
  PaymentPlan,
  PaymentStatus,
} from "../models/payment.model.js";
import { User } from "../models/user.model.js";
import { PAYMENT_PLANS } from "../config/plans.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "../utils/errors.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

const createCheckoutResponse = (payment: {
  orderId: string;
  amount: number;
}) => ({
  key: process.env.RAZORPAY_KEY_ID,
  orderId: payment.orderId,
  amount: payment.amount,
  currency: "INR",
});

export const checkout = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;
  const { plan } = req.body;
  const headerIdempotencyKey = req.headers["idempotency-key"];

  if (!userId) {
    throw new UnauthorizedError("Authentication required");
  }

  if (
    !headerIdempotencyKey ||
    Array.isArray(headerIdempotencyKey) ||
    !headerIdempotencyKey.trim()
  ) {
    throw new BadRequestError("Idempotency-Key is required");
  }

  const idempotencyKey = headerIdempotencyKey.trim();

  if (!Object.values(PaymentPlan).includes(plan)) {
    throw new BadRequestError("Invalid payment plan");
  }

  const validatedPlan = plan as PaymentPlan;
  const selectedPlan = PAYMENT_PLANS[validatedPlan];

  if (!selectedPlan) {
    throw new BadRequestError("Unsupported payment plan");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.hasProAcess()) {
    throw new ConflictError("User already subscribed");
  }

  const existingPayment = await Payment.findOne({ idempotencyKey });

  if (existingPayment) {
    const mismatch =
      existingPayment.userId.toString() !== userId.toString() ||
      existingPayment.plan !== validatedPlan;

    if (mismatch) {
      console.error("Idempotency key conflict", {
        idempotencyKey,
        requestUserId: userId.toString(),
        existingUserId: existingPayment.userId.toString(),
        requestPlan: validatedPlan,
        existingPlan: existingPayment.plan,
      });

      throw new ConflictError("Request could not be processed");
    }

    if (existingPayment.status === PaymentStatus.CAPTURED) {
      throw new ConflictError("Payment already completed for this request");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "", createCheckoutResponse(existingPayment)));
  }

  const order = await instance.orders.create({
    amount: selectedPlan.amount,
    currency: "INR",
    receipt: idempotencyKey,
    notes: {
      userId: userId.toString(),
      plan: validatedPlan,
    },
  });

  try {
    await Payment.create({
      userId,
      orderId: order.id,
      idempotencyKey,
      plan: validatedPlan,
      amount: selectedPlan.amount,
      status: PaymentStatus.CREATED,
    });
  } catch (error: unknown) {
    const mongoError = error as {
      code?: number;
      keyPattern?: Record<string, number>;
    };

    if (mongoError.code === 11000 && mongoError.keyPattern?.idempotencyKey) {
      const payment = await Payment.findOne({ idempotencyKey });

      if (!payment) {
        throw error;
      }

      const mismatch =
        payment.userId.toString() !== userId.toString() ||
        payment.plan !== validatedPlan;

      if (mismatch) {
        throw new ConflictError("Request could not be processed");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, "", createCheckoutResponse(payment)));
    }

    throw error;
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      "",
        createCheckoutResponse({
          orderId: order.id,
          amount: selectedPlan.amount,
        }),
    ),
  );
});
