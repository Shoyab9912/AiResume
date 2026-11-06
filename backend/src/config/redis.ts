import { Redis } from "ioredis";
import { env } from "./env.validation.js";

const redis = new Redis(env.REDIS_URL as string,{
  maxRetriesPerRequest:null
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});


export default redis;

