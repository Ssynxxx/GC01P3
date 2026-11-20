import Redis from "ioredis";

// Cache is an optimisation, never a hard dependency: if Redis is down,
// every helper below silently falls through to MongoDB.
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy: (times) => Math.min(times * 1000, 10000),
});

let lastWarn = 0;
redis.on("error", (err) => {
  if (Date.now() - lastWarn > 15000) {
    lastWarn = Date.now();
    console.warn("[redis] unavailable, running without cache:", err.message);
  }
});

export function connectRedis() {
  return redis.connect().catch(() => {});
}

export const cache = {
  async get(key) {
    try {
      const raw = await redis.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  async set(key, value, ttlSeconds = 300) {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch {
      /* ignore */
    }
  },
  async del(key) {
    try {
      await redis.del(key);
    } catch {
      /* ignore */
    }
  },
};

export default redis;
