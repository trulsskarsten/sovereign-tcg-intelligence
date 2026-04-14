import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Lazy singleton — only instantiated if env vars are present
let ratelimiter: Ratelimit | null = null;

function getRateLimiter(): Ratelimit | null {
  if (ratelimiter) return ratelimiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Rate limiting disabled in dev when Upstash is not configured
    return null;
  }

  ratelimiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 requests per minute
    analytics: false,
  });

  return ratelimiter;
}

/**
 * Applies rate limiting based on shop_domain (from Authorization header) or IP.
 * Returns a 429 response if the limit is exceeded, otherwise null.
 */
export async function applyRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const limiter = getRateLimiter();
  if (!limiter) return null; // Rate limiting not configured — allow all in dev

  // Use shop domain from JWT or fall back to IP
  const authHeader = req.headers.get("Authorization") || "";
  const forwarded = req.headers.get("x-forwarded-for");
  const identifier = authHeader.length > 20
    ? authHeader.split(".")[1] // JWT middle segment as proxy for shop
    : (forwarded?.split(",")[0].trim() ?? "unknown");

  const { success } = await limiter.limit(identifier);

  if (!success) {
    return NextResponse.json(
      { error: "For mange forespørsler. Prøv igjen om 1 minutt." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "Retry-After": "60",
        },
      }
    );
  }

  return null; // No rate limit hit — continue
}
