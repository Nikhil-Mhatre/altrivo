import Redis from "ioredis";

/**
 * Create a new Redis client instance using ioredis.
 *
 * Configuration options are pulled from environment variables,
 * with sensible defaults for local development.
 */
const redis = new Redis(process.env.REDIS_URL!);

/**
 * Export the Redis client so it can be imported and reused
 * throughout the app (e.g., for caching sessions, rate limiting, etc).
 */
export default redis;
