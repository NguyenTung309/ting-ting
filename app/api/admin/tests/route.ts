import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-auth";
import { getAppRecordClient } from "@/lib/app-database";
import { getPublishedTest, testDefinitions } from "@/lib/tests/data";

export const runtime = "nodejs";

const editableTestSlug = "finance-trend";

function editorShape(test: NonNullable<Awaited<ReturnType<typeof getPublishedTest>>>) {
  return {
    slug: test.slug,
    title: test.title,
    version: test.version,
    questions: test.questions.map((question) => ({
      key: question.key,
      prompt: question.prompt,
      options: question.options.map((option) => ({ key: option.key, label: option.label })),
    })),
  };
}

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  const test = await getPublishedTest(editableTestSlug);
  if (!test) return NextResponse.json({ error: "Không tìm thấy bộ câu hỏi." }, { status: 404 });
  const records = getAppRecordClient();
  if (!records) return NextResponse.json({ error: "Chưa cấu hình cơ sở dữ liệu ứng dụng." }, { status: 503 });
  try {
    const saved = await records.find({ collection: "test-definitions", where: { slug: { equals: editableTestSlug } }, limit: 1, overrideAccess: true });
    return NextResponse.json({ test: editorShape(test), updatedAt: String(saved.docs[0]?.updatedAt || "") }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Không tải được bộ câu hỏi từ cơ sở dữ liệu." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  let body: { questions?: unknown };
  try { body = await request.json() as { questions?: unknown }; }
  catch { return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 }); }

  const base = testDefinitions[editableTestSlug];
  const current = await getPublishedTest(editableTestSlug);
  const records = getAppRecordClient();
  if (!base || !current) return NextResponse.json({ error: "Không tìm thấy bộ câu hỏi." }, { status: 404 });
  if (!records) return NextResponse.json({ error: "Chưa cấu hình cơ sở dữ liệu ứng dụng." }, { status: 503 });
  if (!Array.isArray(body.questions) || body.questions.length !== base.questions.length) {
    return NextResponse.json({ error: "Không thể thêm, xóa hoặc đổi thứ tự câu hỏi; chỉ chỉnh nội dung câu hỏi và đáp án." }, { status: 400 });
  }

  const questions: { key: string; prompt: string; options: { key: string; label: string }[] }[] = [];
  for (let index = 0; index < base.questions.length; index += 1) {
    const source = base.questions[index];
    const candidate = body.questions[index] as { key?: unknown; prompt?: unknown; options?: unknown };
    if (candidate?.key !== source.key || !Array.isArray(candidate.options) || candidate.options.length !== source.options.length) {
      return NextResponse.json({ error: `Mã và thứ tự câu ${index + 1} phải giữ nguyên.` }, { status: 400 });
    }
    const prompt = typeof candidate.prompt === "string" ? candidate.prompt.trim() : "";
    if (!prompt || prompt.length > 1_500) return NextResponse.json({ error: `Câu ${index + 1} cần có nội dung từ 1 đến 1.500 ký tự.` }, { status: 400 });
    const options: { key: string; label: string }[] = [];
    for (let optionIndex = 0; optionIndex < source.options.length; optionIndex += 1) {
      const sourceOption = source.options[optionIndex];
      const option = candidate.options[optionIndex] as { key?: unknown; label?: unknown };
      const label = typeof option?.label === "string" ? option.label.trim() : "";
      if (option?.key !== sourceOption.key || !label || label.length > 600) {
        return NextResponse.json({ error: `Mỗi đáp án của câu ${index + 1} phải giữ nguyên mã và có nội dung tối đa 600 ký tự.` }, { status: 400 });
      }
      options.push({ key: sourceOption.key, label });
    }
    questions.push({ key: source.key, prompt, options });
  }

  try {
    const found = await records.find({ collection: "test-definitions", where: { slug: { equals: editableTestSlug } }, limit: 1, overrideAccess: true });
    const data = { slug: editableTestSlug, version: current.version + 1, questions, updatedAt: new Date().toISOString() };
    if (found.docs[0]) await records.update({ collection: "test-definitions", id: found.docs[0].id, data, overrideAccess: true });
    else await records.create({ collection: "test-definitions", data, overrideAccess: true });
    return NextResponse.json({ success: true, version: data.version, updatedAt: data.updatedAt });
  } catch {
    return NextResponse.json({ error: "Không lưu được câu hỏi vào cơ sở dữ liệu." }, { status: 503 });
  }
}
