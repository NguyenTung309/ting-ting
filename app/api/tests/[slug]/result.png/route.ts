import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { createElement } from "react";

import { ResultCard } from "@/components/tests/ResultCard";
import { getPublishedTest } from "@/lib/tests/data";
import { evaluateCompatibilityTest, evaluateFinanceScoringV4FromDefinition } from "@/lib/tests/engine";
import { answersSchema, coupleAnswersSchema } from "@/lib/tests/types";
import { getCurrentUserId } from "@/lib/auth";
import { getPublishedTrendByKey } from "@/lib/trends/data";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!await getCurrentUserId()) return NextResponse.json({ error: "Bạn cần đăng nhập Google để tạo ảnh kết quả." }, { status: 401 });
  const { slug } = await params;
  const definition = await getPublishedTest(slug);
  if (!definition) return NextResponse.json({ error: "Không tìm thấy bộ test." }, { status: 404 });

  const body = (await request.json().catch(() => null)) as unknown;

  try {
    const result = definition.kind === "finance"
      ? (() => {
          const financeBody = body as { answers?: unknown; imageChoice?: "SUN" | "MOON" } | null;
          const parsed = answersSchema.safeParse(financeBody?.answers);
          if (!parsed.success) throw new Error("Câu trả lời không hợp lệ.");
          return evaluateFinanceScoringV4FromDefinition(definition, parsed.data, financeBody?.imageChoice);
        })()
      : (() => {
          const parsed = coupleAnswersSchema.safeParse(body);
          if (!parsed.success) throw new Error("Câu trả lời của hai người không hợp lệ.");
          return evaluateCompatibilityTest(definition, parsed.data.personA, parsed.data.personB);
        })();
    const trend = result.personalityCode ? await getPublishedTrendByKey(result.personalityCode) : null;

    return new ImageResponse(
      createElement(ResultCard, {
        title: trend?.title || result.title,
        summary: trend?.description || result.summary,
        score: result.score,
        characterId: result.characterId,
        imageChoice: result.imageChoice,
      }),
      { width: 1200, height: 630 },
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể tạo ảnh kết quả." }, { status: 400 });
  }
}
