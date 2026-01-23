/**
 * Simple in-memory rate limiter fallback
 * Used when Upstash is not configured
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetAt < now) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function simpleRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 10000
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || entry.resetAt < now) {
    // New window
    const resetAt = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetAt });
    
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetAt,
    };
  }

  if (entry.count >= limit) {
    // Rate limit exceeded
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;
  
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetAt,
  };
}
