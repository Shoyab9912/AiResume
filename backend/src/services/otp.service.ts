
import redis from "../config/redis.js";
import { emailQueue } from "../queues/email.queue.js";
import { generateOtp, hashOtp } from "../utils/otp.js";

export async function createAndSendOtp(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  const jobId = `otp-${cleanEmail}`;

  const existingJob = await emailQueue.getJob(jobId);

  if (existingJob) {
    const state = await existingJob.getState();

    if (state !== "completed" && state !== "failed") {
      return;
    }

    await existingJob.remove();
  }

  const otp = generateOtp();
  const hashed = hashOtp(otp);

  const otpKey = `otp:${cleanEmail}`;

  await redis.set(otpKey, hashed, "EX", 600)

  await emailQueue.add(
    "send-otp",
    { email: cleanEmail, otp },
    { jobId }
  );
}
