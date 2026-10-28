import { COMPATIBILITY_TEST, FINANCE_TEST } from "./default-tests";
import type { TestDefinition } from "./types";
import { getAppRecordClient } from "@/lib/app-database";

export const testDefinitions: Record<string, TestDefinition> = {
  [FINANCE_TEST.slug]: FINANCE_TEST,
  [COMPATIBILITY_TEST.slug]: COMPATIBILITY_TEST,
};

export async function getPublishedTest(slug: string): Promise<TestDefinition | null> {
  const base = testDefinitions[slug];
  if (!base) return null;
  const records = getAppRecordClient();
  if (!records) return base;
  try {
    const found = await records.find({ collection: "test-definitions", where: { slug: { equals: slug } }, limit: 1, overrideAccess: true });
    const saved = found.docs[0];
    const savedQuestions = Array.isArray(saved?.questions) ? saved.questions as Array<Record<string, unknown>> : null;
    if (!savedQuestions) return base;
    const byKey = new Map(savedQuestions.map((question) => [String(question.key || ""), question]));
    const questions = base.questions.map((question) => {
      const savedQuestion = byKey.get(question.key);
      const savedOptions = Array.isArray(savedQuestion?.options) ? savedQuestion.options as Array<Record<string, unknown>> : [];
      const optionLabels = new Map(savedOptions.map((option) => [String(option.key || ""), String(option.label || "")]));
      return {
        ...question,
        prompt: typeof savedQuestion?.prompt === "string" && savedQuestion.prompt.trim() ? savedQuestion.prompt : question.prompt,
        options: question.options.map((option) => ({
          ...option,
          label: optionLabels.get(option.key)?.trim() || option.label,
        })),
      };
    });
    return { ...base, version: Number(saved.version) || base.version, questions };
  } catch {
    return base;
  }
}
