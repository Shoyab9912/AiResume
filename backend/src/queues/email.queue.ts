import { Queue } from "bullmq";
import redis from "../config/redis.js";

export interface OtpJobData {
  email: string;
  otp: string;
}

export const emailQueue = new Queue<OtpJobData>("email-queue", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: true,
  },
});

emailQueue.on("error", (err:Error) => {
  console.error("[Email Queue Error]:", err);
});