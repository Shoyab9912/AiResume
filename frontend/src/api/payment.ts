import { api } from "./axiosClient";

import type {
  CheckoutPayload,
  CheckoutResponse,
} from "../types";

export const paymentApi = {
  checkout: async (
    payload: CheckoutPayload,
    idempotencyKey: string
  ): Promise<CheckoutResponse> => {
    const { data } = await api.post<CheckoutResponse>(
      "/payment/checkout",
      payload,
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    );

    return data;
  },
};