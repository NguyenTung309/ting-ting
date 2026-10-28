import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { getPublishedTest } from "@/lib/tests/data";
import { evaluateCompatibilityTest, evaluateFinanceScoringV4FromDefinition } from "@/lib/tests/engine";
import { persistTestSubmission } from "@/lib/tests/submissions";
import { createPendingResultToken, pendingResultCookieName } from "@/lib/tests/pending-result";
import { getOrCreateResultAnalyticsSessionId, resultAnalyticsSessionCookieName, resultAnalyticsSessionMaxAge } from "@/lib/tests/analytics-session";
import { coupleEvaluationRequestSchema, financeEvaluationRequestSchema } from "@/lib/tests/types";
import { getPublishedTrendByKey } from "@/lib/trends/data";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const definition = await getPublishedTest(slug);
  if (!definition) return NextResponse.json({ error: "Không tìm thấy bộ test." }, { status: 404 });

  const body = (await request.json().catch(() => null)) as unknown;

  try {
    if (definition.kind === "finance") {
      const parsed = financeEvaluationRequestSchema.safeParse(body);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Cần nhập tên và trả lời đầy đủ.");

      const result = evaluateFinanceScoringV4FromDefinition(definition, parsed.data.answers, parsed.data.imageChoice);
      const trend = await getPublishedTrendByKey(result.personalityCode);
      const userId = await getCurrentUserId();
      const sessionId = getOrCreateResultAnalyticsSessionId(request.cookies.get(resultAnalyticsSessionCookieName)?.value);
      const persisted = await persistTestSubmission({
        definition,
        respondentName: parsed.data.respondentName,
        answers: { q0: parsed.data.imageChoice ?? parsed.data.answers.q0, ...parsed.data.answers },
        result,
        trend: trend ?? undefined,
        userId: userId ?? undefined,
        sessionId,
        requireDurable: true,
      });
      if (!persisted.success || !persisted.snapshot) return NextResponse.json({ error: "Chưa lưu được lượt làm vào cơ sở dữ liệu. Câu trả lời chưa được ghi nhận, bạn thử gửi lại nhé." }, { status: 503 });
      const response = NextResponse.json({
        tttCode: persisted.snapshot.tttCode,
        submittedAt: persisted.snapshot.submittedAt,
        resultUrl: `/ket-qua/${persisted.snapshot.tttCode}${userId ? "" : "?claim=1"}`,
        formulaVersion: result.formulaVersion,
        personalityCode: result.personalityCode,
        characterId: result.characterId,
        rawScores: result.rawScores,
        scores: result.scores,
        top1: result.top1,
        top2: result.top2,
        resultType: result.resultType,
        finalProfile: result.finalProfile,
        testVersion: result.testVersion,
      }, { status: 201 });
      response.cookies.set(resultAnalyticsSessionCookieName, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: resultAnalyticsSessionMaxAge,
      });
      if (!userId) response.cookies.set(pendingResultCookieName, createPendingResultToken(persisted.snapshot.tttCode), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 30 * 60,
      });
      return response;
    }

    const parsed = coupleEvaluationRequestSchema.safeParse(body);
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Cần nhập tên hai người và trả lời đầy đủ.");

    const result = evaluateCompatibilityTest(definition, parsed.data.personA, parsed.data.personB);
    const userId = await getCurrentUserId();
    const persisted = await persistTestSubmission({
      definition,
      respondentName: parsed.data.personAName,
      partnerName: parsed.data.personBName,
      answers: { personA: parsed.data.personA, personB: parsed.data.personB },
      result,
      userId: userId ?? undefined,
      requireDurable: true,
    });
    if (!persisted.success || !persisted.snapshot) return NextResponse.json({ error: "Chưa lưu được lượt làm vào cơ sở dữ liệu. Câu trả lời chưa được ghi nhận, bạn thử gửi lại nhé." }, { status: 503 });
    const response = NextResponse.json({ tttCode: persisted.snapshot.tttCode, submittedAt: persisted.snapshot.submittedAt, resultUrl: `/ket-qua/${persisted.snapshot.tttCode}${userId ? "" : "?claim=1"}` }, { status: 201 });
    if (!userId) response.cookies.set(pendingResultCookieName, createPendingResultToken(persisted.snapshot.tttCode), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 60,
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Câu trả lời không hợp lệ." }, { status: 400 });
  }
}
