import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import aiRoutes from "./routes/ai.route.js";
import webhookRoutes from "./routes/webhook.route.js";
import paymentRoutes from "./routes/payment.route.js";
import { generalRateLimiter } from "./middlewares/ratelimit.middleware.js";
import { allowedOrigins } from "./config/cors.js";


const app = express();

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://*.razorpay.com"],
        connectSrc: ["'self'", "https://*.razorpay.com"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://*.razorpay.com"],
        frameSrc: ["'self'", "https://*.razorpay.com"],
        frameAncestors: ["'none'"],
      },
    },
  }),
);



app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use("/api/v1/webhooks", express.raw({ type: "application/json" }), webhookRoutes);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

app.use(generalRateLimiter);

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/payment", paymentRoutes);

app.use(errorHandler);

export default app;