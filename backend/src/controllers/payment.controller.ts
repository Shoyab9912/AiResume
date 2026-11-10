import { Response } from "express";
import Razorpay from "razorpay";
import { Payment, PaymentPlan, PaymentStatus } from "../models/payment.model.js";
import { User } from "../models/user.model.js";
import { PAYMENT_PLANS } from "../config/plans.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const LEASE_MS = 30_000;
const MAX_KEY_LENGTH = 36;

const isDuplicateKeyError = (err: unknown): boolean =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  (err as { code?: number }).code === 11000;

const createCheckoutResponse = (payment: {
  orderId: string;
  amount: number;
  currency: string;
}) => ({
  key: process.env.RAZORPAY_KEY_ID,
  orderId: payment.orderId,
  amount: payment.amount,
  currency: payment.currency,
});

const sendCheckout = (
  res: Response,
  status: number,
  payment: { orderId: string; amount: number; currency: string },
) =>
  res
    .status(status)
    .json(new ApiResponse(status, "", createCheckoutResponse(payment)));

export const checkout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const { plan } = req.body;
    const headerIdempotencyKey = req.headers["idempotency-key"];

    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    if (
      !headerIdempotencyKey ||
      Array.isArray(headerIdempotencyKey) ||
      !headerIdempotencyKey.trim() ||
      headerIdempotencyKey.trim().length > MAX_KEY_LENGTH
    ) {
      throw new BadRequestError(
        `Valid Idempotency-Key header (max ${MAX_KEY_LENGTH} chars) is required`,
      );
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

    const amount: number = selectedPlan.amount;
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error(`Invalid configured amount for plan ${validatedPlan}`);
    }

    const user = await User.findById(userId);
  
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.hasProAccess()) {
      throw new ConflictError("User already subscribed");
    }

   
    const openPayment = await Payment.findOne({
      userId,
      plan: validatedPlan,
      amount,
      orderId: { $ne: null },
      status: { $in: [PaymentStatus.CREATED, PaymentStatus.FAILED] },
    }).sort({ createdAt: -1 });

    if (openPayment?.orderId) {
      return sendCheckout(res, 200, {
        orderId: openPayment.orderId,
        amount: openPayment.amount,
        currency: openPayment.currency,
      });
    }

   
    const payment = await Payment.findOneAndUpdate(
      { userId, idempotencyKey },
      {
        $setOnInsert: {
          plan: validatedPlan,
          amount,
          currency: "INR",
          status: PaymentStatus.INITIATING,
          lockUntil: null,
        },
      },
      { upsert: true, returnDocument: "after",runValidators:true },
    ).catch(async (err: unknown) => {
      if (isDuplicateKeyError(err)) {
        return Payment.findOne({ userId, idempotencyKey });
      }
      throw err;
    });

    if (!payment) {
      throw new ConflictError("Unable to initialize checkout request");
    }

    if (payment.plan !== validatedPlan || payment.amount !== amount) {
      throw new ConflictError("Idempotency key reused with different payload");
    }

    if (payment.status === PaymentStatus.CAPTURED) {
      throw new ConflictError("Payment already completed");
    }

    if (
      payment.orderId &&
      (payment.status === PaymentStatus.CREATED ||
        payment.status === PaymentStatus.FAILED)
    ) {
      return sendCheckout(res, 200, {
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
      });
    }

    
    const now = new Date();
    const leaseUntil = new Date(now.getTime() + LEASE_MS);

    const leaseOwner = await Payment.findOneAndUpdate(
      {
        _id: payment._id,
        status: PaymentStatus.INITIATING,
        $or: [{ lockUntil: null }, { lockUntil: { $lt: now } }],
      },
      { $set: { lockUntil: leaseUntil } },
      { returnDocument: "after",runValidators:true },
    );

    if (!leaseOwner) {
      const latestPayment = await Payment.findById(payment._id).lean();

      if (latestPayment?.status === PaymentStatus.CAPTURED) {
        throw new ConflictError("Payment already completed");
      }

      if (
        latestPayment?.orderId &&
        (latestPayment.status === PaymentStatus.CREATED ||
          latestPayment.status === PaymentStatus.FAILED)
      ) {
        return sendCheckout(res, 200, {
          orderId: latestPayment.orderId,
          amount: latestPayment.amount,
          currency: latestPayment.currency,
        });
      }

      throw new ConflictError("Checkout request already in progress");
    }

    try {
      const order = await instance.orders.create({
        amount,
        currency: "INR",
        receipt: payment._id.toString(),
        notes: {
          userId: userId.toString(),
          plan: validatedPlan,
        },
      });

      
      const updatedPayment = await Payment.findOneAndUpdate(
        {
          _id: payment._id,
          status: PaymentStatus.INITIATING,
          lockUntil: leaseUntil,
        },
        {
          $set: { orderId: order.id, status: PaymentStatus.CREATED },
          $unset: { lockUntil: 1 },
        },
        { returnDocument: "after",runValidators:true },
      );

      if (!updatedPayment || !updatedPayment.orderId) {
        throw new ConflictError(
          "Checkout state changed unexpectedly. Please retry.",
        );
      }

      return sendCheckout(res, 201, {
        orderId: updatedPayment.orderId,
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
      });
    } catch (error) {
       await Payment.updateOne(
        { _id: payment._id, lockUntil: leaseUntil },
        { $unset: { lockUntil: 1 } },
      );

      throw error;
    }
  },
);