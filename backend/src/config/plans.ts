import { PaymentPlan } from "../models/payment.model.js";

export const PAYMENT_PLANS = {
  [PaymentPlan.MONTHLY]: {
    amount: 29900,
    durationDays: 30,
  },
  [PaymentPlan.SIX_MONTH]: {
    amount: 149900,
    durationDays: 180,
  },
} as const;