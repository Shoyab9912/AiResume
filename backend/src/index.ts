import "dotenv/config";
import express from "express";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import aiRoutes from "./routes/ai.route.js";
import webhookRoutes from "./routes/webhook.route.js";
import paymentRoutes from "./routes/payment.route.js";
import connect from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { authRateLimiter,generalRateLimiter } from "./middlewares/ratelimit.middleware.js";

const app = express();

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: {
      policy: "same-origin-allow-popups",
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://*.razorpay.com"],
        connectSrc: ["'self'", "https://*.razorpay.com"],
        styleSrc: ["'self'"],
        frameSrc: ["'self'", "https://*.razorpay.com"],
        frameAncestors: ["'none'"],
      },
    },
  }),
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "6mb" }));
app.use(express.urlencoded({ extended: true, limit: "6mb" }));
app.use(cookieParser());

app.use("/api/v1/webhooks", webhookRoutes);

app.use(generalRateLimiter)
app.use("/api/v1/auth",authRateLimiter)
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/payment", paymentRoutes);

app.use(errorHandler);

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
