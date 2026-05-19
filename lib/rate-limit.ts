export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const MAX_KEYS = 10_000;

export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private lastPruneAt = 0;

  constructor(
    private readonly config: RateLimitConfig,
    private readonly now: () => number = Date.now,
  ) {}

  check(key: string): RateLimitResult {
    const t = this.now();
    this.maybePrune(t);
    let b = this.buckets.get(key);
    if (!b || b.resetAt <= t) {
      b = { count: 0, resetAt: t + this.config.windowMs };
      this.buckets.set(key, b);
    }
    b.count += 1;
    const remaining = Math.max(0, this.config.limit - b.count);
    const allowed = b.count <= this.config.limit;
    return {
      allowed,
      limit: this.config.limit,
      remaining,
      resetAt: b.resetAt,
      retryAfterSec: Math.max(0, Math.ceil((b.resetAt - t) / 1000)),
    };
  }

  reset(key?: string) {
    if (key === undefined) this.buckets.clear();
    else this.buckets.delete(key);
  }

  size() {
    return this.buckets.size;
  }

  private maybePrune(t: number) {
    if (t - this.lastPruneAt < this.config.windowMs) return;
    this.lastPruneAt = t;
    if (this.buckets.size < MAX_KEYS) {
      for (const [k, b] of this.buckets) {
        if (b.resetAt <= t) this.buckets.delete(k);
      }
      return;
    }
    this.buckets.clear();
  }
}

export const searchLimiter = new RateLimiter({
  limit: Number(process.env.RATE_LIMIT_SEARCH_PER_MIN) || 30,
  windowMs: 60_000,
});

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(r.limit),
    "X-RateLimit-Remaining": String(r.remaining),
    "X-RateLimit-Reset": String(Math.floor(r.resetAt / 1000)),
    ...(r.allowed ? {} : { "Retry-After": String(r.retryAfterSec) }),
  };
}
