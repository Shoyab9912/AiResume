import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import toast from "react-hot-toast";

import { paymentApi } from "../api/payment";
import type { CheckoutPayload, CheckoutResponse } from "../types";
import { extractErrorMessage } from "../utils/error";

interface RazorpayFailureResponse {
  error?: {
    description?: string;
    code?: string;
    reason?: string;
  };
}

let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if ("Razorpay" in window) return Promise.resolve();

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        razorpayScriptPromise = null;
        reject(new Error("Failed to load Razorpay SDK"));
      };
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

export const usePaymentMutations = () => {
  const queryClient = useQueryClient();
  const idempotencyKeyRef = useRef<string | null>(null);

  const checkoutMutation = useMutation<
    CheckoutResponse,
    unknown,
    CheckoutPayload
  >({
    mutationFn: async (payload) => {
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = crypto.randomUUID();
      }
      return paymentApi.checkout(payload, idempotencyKeyRef.current);
    },
    retry: (failureCount, error) => {
      const status = (error as { status?: number })?.status;
      if (status && status >= 400 && status < 500) return false;
      return failureCount < 2;
    },
  });

  const startPayment = async (payload: CheckoutPayload) => {
    if (checkoutMutation.isPending) return;

    try {
      await loadRazorpayScript();
    } catch {
      toast.error(
        "Payment gateway failed to load. Please disable ad blockers and refresh.",
      );
      return;
    }

    try {
      const order = await checkoutMutation.mutateAsync(payload);
      idempotencyKeyRef.current = null;
      console.log("START PAYMENT");
      const razorpay = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Nova Forge",
        description:
          payload.plan === "monthly"
            ? "Nova Forge AI Monthly Plan"
            : "Nova Forge Six Month Plan",
        order_id: order.orderId,
        handler: () => {
          queryClient.invalidateQueries({ queryKey: ["authUser"] });
          toast.success("Payment received. Confirming your subscription...");
        },
        modal: {
          ondismiss: () => {
            console.log("RAZORPAY DISMISSED");
            toast("Payment cancelled");
          },
        },
        theme: { color: "#6366f1" },
      });

      razorpay.on("payment.failed", (response: RazorpayFailureResponse) => {
        toast.error(
          response.error?.description || "Payment failed. Please try again.",
        );
      });

      console.log("RAZORPAY INSTANCE CREATED");
      razorpay.open();
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error));
    }
  };

  return { checkoutMutation, startPayment };
};
