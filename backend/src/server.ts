import { env } from "./config/env.validation.js";
import mongoose from "mongoose";
import app from "./app.js";
import connect from "./config/db.js";
import redis from "./config/redis.js";
import { emailWorker } from "./workers/email.worker.js";

const PORT = Number(env.PORT);
const SHUTDOWN_TIMEOUT_MS = 10_000;

let shuttingDown = false;

async function start() {
  await connect();

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  const shutdown = async (reason: string, exitCode = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`Shutting down (${reason})`);

    const forceExit = setTimeout(() => {
      console.error("Shutdown timed out, forcing exit");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    try {
      await new Promise<void>((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve())),
      );
      await emailWorker.close();
      await mongoose.connection.close();
      await redis.quit();

      console.log("Shutdown complete");
      process.exit(exitCode);
    } catch (err) {
      console.error("Error during shutdown", err);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("unhandledRejection", (err) => {
    console.error("Unhandled rejection", err);
    void shutdown("unhandledRejection", 1);
  });
  process.on("uncaughtException", (err) => {
    console.error("Uncaught exception", err);
    void shutdown("uncaughtException", 1);
  });
}

start().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});