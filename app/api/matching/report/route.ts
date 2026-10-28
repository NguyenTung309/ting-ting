import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { getAppRecordClient } from "@/lib/app-database";
import { matchingEnabled } from "@/lib/matching";

export async function POST(request: NextRequest) {
  if (!matchingEnabled()) return NextResponse.json({ error: "Matching sắp ra mắt." }, { status: 503 });
  const reporter = await getCurrentUserId(); const cms = await getAppRecordClient(); const parsed = z.object({ userId: z.union([z.string(), z.number()]), reason: z.enum(["spam", "harassment", "inappropriate", "other"]), details: z.string().max(1000).optional() }).safeParse(await request.json().catch(() => null));
  if (!reporter || !cms) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  if (!parsed.success || String(parsed.data.userId) === reporter) return NextResponse.json({ error: "Báo cáo không hợp lệ." }, { status: 400 });
  const created = await cms.create({ collection: "reports", data: { reporter: Number(reporter), targetUser: Number(parsed.data.userId), reason: parsed.data.reason, details: parsed.data.details, status: "open" }, overrideAccess: true });
  await cms.create({ collection: "audit-logs", data: { action: "report", actor: Number(reporter), targetType: "user", targetId: String(parsed.data.userId), metadata: { reason: parsed.data.reason, reportId: created.id } }, overrideAccess: true });
  return NextResponse.json({ success: true, id: created.id });
}
