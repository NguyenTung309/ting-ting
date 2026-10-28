import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import { getAppRecordClient } from "@/lib/app-database";
import { matchingEnabled } from "@/lib/matching";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const schema = z.object({ profileId: z.union([z.string(), z.number()]), message: z.string().trim().min(1).max(500), promptId: z.string().max(80).optional() });
export async function GET() {
  if (!matchingEnabled()) return NextResponse.json({ error: "Matching sắp ra mắt." }, { status: 503 });
  const userId = await getCurrentUserId(); const cms = await getAppRecordClient();
  if (!userId || !cms) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  const result = await cms.find({ collection: "connection-requests", where: { receiver: { equals: userId } }, sort: "-createdAt", limit: 50, overrideAccess: true });
  return NextResponse.json({ requests: (result.docs as unknown as Record<string, unknown>[]).map((row) => ({ id: row.id, message: row.message, status: row.status, senderId: typeof row.sender === "object" && row.sender ? (row.sender as { id: unknown }).id : row.sender, createdAt: row.createdAt })) });
}

export async function POST(request: NextRequest) {
  if (!matchingEnabled()) return NextResponse.json({ error: "Matching sắp ra mắt." }, { status: 503 });
  const rate = rateLimit(request, "matching-greeting", 10, 60_000); if (!rate.ok) return rateLimitResponse(rate.retryAfter);
  const sender = await getCurrentUserId(); const cms = await getAppRecordClient(); const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!sender || !cms) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  if (!parsed.success) return NextResponse.json({ error: "Lời chào chưa hợp lệ." }, { status: 400 });
  const profile = await cms.findByID({ collection: "matching-profiles", id: parsed.data.profileId, depth: 0, overrideAccess: true }).catch(() => null);
  const receiver = profile && typeof profile.user === "object" ? String((profile.user as { id: unknown }).id) : String(profile?.user ?? "");
  if (!profile || !profile.enabled || profile.status !== "active" || !receiver || receiver === sender) return NextResponse.json({ error: "Hồ sơ này không nhận lời chào." }, { status: 400 });
  const existing = await cms.find({ collection: "connection-requests", where: { or: [{ and: [{ sender: { equals: sender } }, { receiver: { equals: receiver } }] }, { and: [{ sender: { equals: receiver } }, { receiver: { equals: sender } }] }] }, limit: 1, overrideAccess: true });
  if (existing.docs[0] && ["rejected", "blocked", "accepted", "pending"].includes(String((existing.docs[0] as unknown as Record<string, unknown>).status))) return NextResponse.json({ error: "Hai bạn đã có một lời mời trước đó." }, { status: 409 });
  const created = await cms.create({ collection: "connection-requests", data: { sender: Number(sender), receiver: Number(receiver), message: parsed.data.message, promptId: parsed.data.promptId, status: "pending" }, overrideAccess: true });
  return NextResponse.json({ id: created.id, status: created.status });
}
