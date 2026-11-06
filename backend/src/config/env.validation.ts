import "dotenv/config";
import { z } from "zod";


const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().int().min(1).max(65535).default(4000),

  MONGO_URI: z
    .string()
    .min(1, "MONGO_URI is required")
    .refine(
      (value) =>
        value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"),
      "MONGO_URI must be a valid MongoDB connection URI",
    ),

  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),

  ACCESS_TOKEN_SECRET: z
    .string()
    .min(32, "ACCESS_TOKEN_SECRET must be at least 32 characters"),

  REFRESH_TOKEN_SECRET: z
    .string()
    .min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters"),

  CORS_ORIGIN: z.url().refine((value) => {
    const url = new URL(value);
    return url.origin === value;
  }, "CORS_ORIGIN must contain only the origin, without a path or trailing slash"),

  GOOGLE_API_KEY: z.string().min(1, "GOOGLE_API_KEY is required"),

  RAZORPAY_KEY_ID: z.string().min(1, "RAZORPAY_KEY_ID is required"),

  RAZORPAY_KEY_SECRET: z.string().min(1, "RAZORPAY_KEY_SECRET is required"),

  RAZORPAY_WEBHOOK_SECRET: z
    .string()
    .min(1, "RAZORPAY_WEBHOOK_SECRET is required"),

  GMAIL_USER: z.email("GMAIL_USER must be a valid email address"),

  GMAIL_PASS: z.string().min(1, "GMAIL_PASS is required"),

  REDIS_URL: z
    .string()
    .min(1, "REDIS_URL is required")
    .refine(
      (value) => value.startsWith("redis://") || value.startsWith("rediss://"),
      "REDIS_URL must start with redis:// or rediss://",
    ),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("\n❌ Invalid environment configuration:\n");

  for (const issue of parsedEnv.error.issues) {
    console.error(`  • ${issue.path.join(".")}: ${issue.message}`);
  }

  console.error("\nPlease fix your .env file and restart the application.\n");

  process.exit(1);
}



export const env = parsedEnv.data;
