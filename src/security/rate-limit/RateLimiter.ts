export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
}

/**
 * Lightweight sliding-window limiter. Swap store for Redis in production edge.
 */
export class RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private windowMs = 60_000,
    private max = 120
  ) {}

  check(key: string, max = this.max): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const prev = (this.hits.get(key) ?? []).filter((t) => t > windowStart);
    if (prev.length >= max) {
      this.hits.set(key, prev);
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(0, (prev[0] ?? now) + this.windowMs - now),
      };
    }
    prev.push(now);
    this.hits.set(key, prev);
    return { allowed: true, remaining: Math.max(0, max - prev.length) };
  }

  reset(key?: string): void {
    if (key) this.hits.delete(key);
    else this.hits.clear();
  }
}

export const globalRateLimiter = new RateLimiter();
export const toolRateLimiter = new RateLimiter(60_000, 30);
