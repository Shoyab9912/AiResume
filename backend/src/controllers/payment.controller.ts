import Razorpay from "razorpay";
import { Response } from "express";
import { User } from "../models/user.model.js";
import { Payment } from "../models/payment.model.js";
import { PAYMENT_PLANS } from "../config/plans.js";
import asyncHandler from "../utils/asyncHandler.js";
import { PaymentPlan, PaymentStatus } from "../models/payment.model.js";
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
  currency: string;
}) => ({
  key: process.env.RAZORPAY_KEY_ID,
  orderId: payment.orderId,
  amount: payment.amount,
  currency: payment.currency,
});

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
      !headerIdempotencyKey.trim()
    ) {
      throw new BadRequestError("Valid Idempotency-Key header is required ");
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

    if (user.hasProAccess()) {
      throw new ConflictError("User already subscribed");
    }

    const payment = await Payment.findOneAndUpdate(
      {
        userId,
        idempotencyKey,
      },
      {
        $setOnInsert: {
          userId,
          idempotencyKey,
          plan: validatedPlan,
          amount: selectedPlan.amount,
          currency: "INR",
          status: PaymentStatus.INITIATING,
          lockUntil: null,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    ).catch(async (err: unknown) => {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === 11000
      ) {
        return Payment.findOne({ userId, idempotencyKey });
      }

      throw err;
    });

    if (!payment) {
      throw new ConflictError("Unable to initialize checkout request");
    }

    if (
      payment.plan !== validatedPlan ||
      payment.amount !== selectedPlan.amount
    ) {
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
      return res.status(200).json(
        new ApiResponse(
          200,
          "",
          createCheckoutResponse({
            orderId: payment.orderId,
            amount: payment.amount,
            currency: payment.currency,
          }),
        ),
      );
    }

    const now = new Date();
    const leaseUntil = new Date(now.getTime() + 15_000);

    const lockOwner = await Payment.findOneAndUpdate(
      {
        _id: payment._id,
        status: PaymentStatus.INITIATING,
        $or: [{ lockUntil: null }, { lockUntil: { $lt: now } }],
      },
      {
        $set: {
          lockUntil: leaseUntil,
        },
      },
      {
        returnDocument: "after",
      },
    );

    if (!lockOwner) {
      const latestPayment = await Payment.findById(payment._id).lean();

      if (latestPayment?.status === PaymentStatus.CAPTURED) {
        throw new ConflictError("Payment already completed");
      }

      if (
        latestPayment?.orderId &&
        (latestPayment.status === PaymentStatus.CREATED ||
          latestPayment.status === PaymentStatus.FAILED)
      ) {
        return res.status(200).json(
          new ApiResponse(
            200,
            "",
            createCheckoutResponse({
              orderId: latestPayment.orderId,
              amount: latestPayment.amount,
              currency: latestPayment.currency,
            }),
          ),
        );
      }

      throw new ConflictError("Checkout request already in progress");
    }

    try {
      const receipt = payment._id.toString();

      let razorpayOrderId: string | null = null;
      const existingOrders = await instance.orders.all({
        receipt,
        count: 1,
      });

      if (existingOrders?.items?.length > 0) {
        razorpayOrderId = existingOrders.items[0]!.id;
      } else {
        const order = await instance.orders.create({
          amount: selectedPlan.amount,
          currency: "INR",
          receipt,
          notes: {
            userId: userId.toString(),
            plan: validatedPlan,
          },
        });
        razorpayOrderId = order.id;
      }

      const updatedPayment = await Payment.findOneAndUpdate(
        {
          _id: payment._id,
          status: PaymentStatus.INITIATING,
        },
        {
          $set: {
            orderId: razorpayOrderId,
            status: PaymentStatus.CREATED,
          },
          $unset: {
            lockUntil: 1,
          },
        },
        {
          returnDocument: "after",
        },
      );

      if (!updatedPayment || !updatedPayment.orderId) {
        throw new ConflictError("Payment state changed unexpectedly");
      }

      return res.status(201).json(
        new ApiResponse(
          201,
          "",
          createCheckoutResponse({
            orderId: updatedPayment.orderId,
            amount: updatedPayment.amount,
            currency: updatedPayment.currency,
          }),
        ),
      );
    } catch (error) {
      await Payment.updateOne(
        {
          _id: payment._id,
          lockUntil: leaseUntil,
        },
        {
          $unset: {
            lockUntil: 1,
          },
        },
      );
      throw error;
    }
  },
);
