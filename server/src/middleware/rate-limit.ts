import type { NextFunction, Request, Response } from "express";

type RateLimitOptions = {
  maxRequests: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

/** Small in-memory guard for the hackathon's single server process. */
export function createRateLimiter({ maxRequests, windowMs }: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();

  return (request: Request, response: Response, next: NextFunction) => {
    const now = Date.now();
    const key = request.ip || "unknown";
    const existing = buckets.get(key);
    const bucket = !existing || existing.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : existing;

    bucket.count += 1;
    buckets.set(key, bucket);

    response.setHeader("RateLimit-Limit", maxRequests);
    response.setHeader("RateLimit-Remaining", Math.max(0, maxRequests - bucket.count));
    response.setHeader("RateLimit-Reset", Math.ceil(bucket.resetAt / 1000));

    if (bucket.count > maxRequests) {
      response.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
      response.status(429).json({ error: "Too many call attempts. Please try again shortly." });
      return;
    }

    next();
  };
}
