import "server-only";

/**
 * Simple in-memory sliding-window rate limiter. Free and zero-config.
 * On serverless hosts each instance has its own memory, so this is
 * best-effort — good enough to stop casual abuse of your free AI quota.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    const retryAfter = Math.ceil((windowMs - (now - hits[0])) / 1000);
    buckets.set(key, hits);
    return { ok: false as const, retryAfter };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return { ok: true as const, remaining: limit - hits.length };
}

export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] || req.headers.get("x-real-ip") || "local").trim();
}

export function roastLimit() {
  const n = Number(process.env.RATE_LIMIT_PER_HOUR);
  return Number.isFinite(n) && n > 0 ? n : 20;
}
