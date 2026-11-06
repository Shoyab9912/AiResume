import { Worker, type Job } from "bullmq";
import redis from "../config/redis.js";
import { type OtpJobData } from "../queues/email.queue.js";
import { sendEmail } from "../services/email.service.js";

export const emailWorker = new Worker<OtpJobData>(
  "email-queue",
  async (job: Job<OtpJobData>) => {
    const { email, otp } = job.data;

    await sendEmail(email, otp);
  },
  {
    connection: redis,
    concurrency: 5,
  },
);

emailWorker.on(
  "failed",
  (job: Job<OtpJobData> | undefined, err: Error) => {
    console.error(
      `[Email Worker] Failed to send OTP to ${job?.data?.email} (Attempt ${job?.attemptsMade}):`,
      err,
    );
  },
);

emailWorker.on("error", (err: Error) => {
  console.error("[Email Worker Connection Error]:", err);
});