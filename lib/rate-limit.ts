import type { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };
const runtime = globalThis as typeof globalThis & { __tttRateBuckets?: Map<string, Bucket> };
const buckets = runtime.__tttRateBuckets ??= new Map();

export function rateLimit(request: NextRequest, key: string, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  const bucketKey = `${key}:${ip}`;
  const current = buckets.get(bucketKey);
  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  current.count += 1;
  if (current.count > limit) return { ok: false, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  return { ok: true, retryAfter: 0 };
}

export function rateLimitResponse(retryAfter: number) {
  return new Response(JSON.stringify({ error: "Bạn thao tác hơi nhanh. Vui lòng thử lại sau." }), { status: 429, headers: { "content-type": "application/json", "retry-after": String(retryAfter) } });
}
