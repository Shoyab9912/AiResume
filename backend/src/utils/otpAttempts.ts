
import { generateHash } from "./generateHash.js";
import redis from "../config/redis.js";

export const MAX_OTP_ATTEMPTS = 5;
const ATTEMPT_WINDOW = 15 * 60 * 1000;

export function getOtpAttemptKey(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();

  const emailHash = generateHash(normalizedEmail)

  return `otp:attempts:${emailHash}`;
}

export async function incrementOtpAttempts(
  otpKey: string,
  attemptsKey: string
): Promise<number> {

    const otpTtl = await redis.pttl(otpKey);

  if (otpTtl <= 0) {
    return -1;
  }

  const results = await redis
    .multi()
    .incr(attemptsKey)
    .pexpire(attemptsKey, ATTEMPT_WINDOW, "NX")
    .exec();

  if (!results) {
    throw new Error("Failed to update OTP attempts");
  }


  for (const result of results) {
    if (result[0]) {
      throw result[0];
    }
  }

  const attempts = Number(results[0]![1]);

   if (attempts >= MAX_OTP_ATTEMPTS) {
    await redis.unlink(otpKey);
  }

  return attempts;
}
