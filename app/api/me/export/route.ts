import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { getAppRecordClient } from "@/lib/app-database";

export async function GET() {
  const userId = await getCurrentUserId();
  const cms = await getAppRecordClient();
  if (!userId || !cms) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  const user = await cms.findByID({ collection: "users", id: userId, overrideAccess: true });
  const results = await cms.find({ collection: "test-submissions", where: { user: { equals: userId } }, limit: 100, overrideAccess: true });
  return NextResponse.json({ exportedAt: new Date().toISOString(), profile: { email: user.email, displayName: user.displayName, avatar: user.avatar }, results: results.docs.map((doc) => ({ tttCode: doc.tttCode, characterId: doc.characterId, personalityCode: doc.personalityCode, formulaVersion: doc.formulaVersion, resultTitle: doc.resultTitle, submittedAt: doc.submittedAt })) });
}
