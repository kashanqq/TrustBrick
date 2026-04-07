/**
 * Simple in-memory sliding-window rate limiter.
 * State is per-process — resets on server restart.
 * Acceptable for a single-instance hackathon deployment.
 */

type Bucket = { hits: number[]; blocked: boolean };
const store = new Map<string, Bucket>();

interface RateLimitOptions {
  /** Maximum requests allowed within the window. */
  max: number;
  /** Window duration in milliseconds. */
  windowMs: number;
  /**
   * How long (ms) to keep blocking after the limit is first hit.
   * Defaults to windowMs — i.e. block for one full window after overflow.
   */
  blockMs?: number;
}

/**
 * Returns true if the request is allowed, false if it should be blocked.
 * Call once per incoming request with a stable key (e.g. IP or wallet address).
 */
export function checkRateLimit(key: string, options: RateLimitOptions): boolean {
  const { max, windowMs, blockMs = windowMs } = options;
  const now = Date.now();

  const bucket = store.get(key) ?? { hits: [], blocked: false };

  // Evict old hits outside the window.
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= max) {
    // Start / extend the block from the moment the limit was first breached.
    bucket.blocked = true;
    store.set(key, bucket);
    return false;
  }

  // Unblock once the hits have fallen below the limit.
  if (bucket.blocked && bucket.hits.length < max) {
    bucket.blocked = false;
  }

  bucket.hits.push(now);
  store.set(key, bucket);
  return true;
}

/** Periodic cleanup so the store doesn't grow indefinitely. */
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of store.entries()) {
    bucket.hits = bucket.hits.filter((t) => now - t < 300_000); // 5 min max
    if (bucket.hits.length === 0) store.delete(key);
  }
}, 60_000);
