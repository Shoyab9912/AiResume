import { Payment, PaymentPlan, PaymentStatus } from "../models/payment.model.js";
import { User } from "../models/user.model.js";
import { PAYMENT_PLANS } from "../config/plans.js";
import  asyncHandler  from "../utils/asyncHandler.js";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError
} from "../utils/errors.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import razorpay from "razorpay";

const instance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export const checkout = asyncHandler(async (req:AuthenticatedRequest, res) => {


  const userId = req.user?._id;
  const { plan } = req.body;
  const idempotencyKey = req.headers["idempotency-key"];

  if (!userId) {
    throw new UnauthorizedError("Authentication required");
  }

  if (!idempotencyKey || Array.isArray(idempotencyKey)) {
    throw new BadRequestError("Idempotency-Key is required");
  }

  if (!Object.values(PaymentPlan).includes(plan)) {
    throw new BadRequestError("Invalid payment plan");
  }

  const validatedPlan = plan as PaymentPlan;

  const existingPayment = await Payment.findOne({ idempotencyKey });

  if (existingPayment) {
    const mismatch =
      existingPayment.userId.toString() !== userId.toString() ||
      existingPayment.plan !== plan;

    if (mismatch) {
      console.error("Idempotency key conflict", {
        idempotencyKey,
        requestUserId: userId.toString(),
        existingUserId: existingPayment.userId.toString(),
        requestPlan: plan,
        existingPlan: existingPayment.plan,
      });
      throw new ConflictError("Request could not be processed");
    }

    return res.status(200).json(new ApiResponse(200,"",{
       key:process.env.RAZORPAY_KEY_ID,
      orderId: existingPayment.orderId,
      amount: existingPayment.amount,
      currency:"INR"
    }));
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.hasProAcess()) {
    throw new ConflictError("User already subscribed");
  }

  const selectedPlan = PAYMENT_PLANS[validatedPlan];
  const order = await instance.orders.create({
    amount: selectedPlan.amount,
    currency: "INR",
    receipt: idempotencyKey,
    notes: {
      userId: userId.toString(),
      plan,
    },
  });

  try {
    await Payment.create({
      userId,
      orderId: order.id,
      idempotencyKey,
      plan,
      amount: selectedPlan.amount,
      status: PaymentStatus.CREATED,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      const payment = await Payment.findOne({ idempotencyKey });
      if (!payment) {
        throw error;
      }
      return res.status(200).json(new ApiResponse(200,"",{
        key:process.env.RAZORPAY_KEY_ID,
        orderId: payment.orderId,
        amount: payment.amount,
        currency: "INR",
      }));
    }
    throw error;
  }

  return res.status(201).json(new ApiResponse(201,"",{
    key:process.env.RAZORPAY_KEY_ID,
    orderId: order.id,
    amount: selectedPlan.amount,
    currency: "INR",
  }));
});