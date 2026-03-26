import Redis from "ioredis";
import { ENV } from "./env.js";

// Create and export the Redis client using the URL from env
export const redis = new Redis(ENV.REDIS_URL);