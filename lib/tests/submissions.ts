import { randomInt } from "node:crypto";

import { getAppRecordClient, markAppDatabaseUnavailable } from "@/lib/app-database";
import type { TrendProfile, PublicTestResult } from "@/lib/trends/types";
import type { EvaluationResponse, TestDefinition } from "./types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const localRuntime = globalThis as typeof globalThis & { __tttLocalSubmissions?: Map<string, PublicTestResult> };
const localSubmissions = localRuntime.__tttLocalSubmissions ??= new Map<string, PublicTestResult>();
const financeManagerTags: Record<string, string> = {
  experience: "Spender",
  security: "Saver",
  control: "Controller",
  independence: "Independent",
  avoidance: "Avoider",
};

function buildScoringNotes(definition: TestDefinition, answers: Record<string, unknown>) {
  if (definition.kind !== "finance") return undefined;

  const dimensionLabels = new Map(definition.dimensions.map((dimension) => [dimension.key, dimension.label]));
  return definition.questions.flatMap((question) => {
    const selectedOptionKey = String(answers[question.key] ?? "");
    const selectedOption = question.options.find((option) => option.key === selectedOptionKey);
    if (!selectedOption) return [];

    return [{
      questionKey: question.key,
      question: question.prompt,
      selectedOptionKey,
      selectedOption: selectedOption.label,
      contributions: selectedOption.weights.map((weight) => ({
        managerTag: financeManagerTags[weight.dimensionKey] ?? weight.dimensionKey,
        dimensionKey: weight.dimensionKey,
        dimensionLabel: dimensionLabels.get(weight.dimensionKey) ?? weight.dimensionKey,
        points: weight.points,
      })),
    }];
  });
}

function buildQuestionSnapshot(definition: TestDefinition, answers: Record<string, unknown>) {
  const personA = answers.personA && typeof answers.personA === "object" ? answers.personA as Record<string, unknown> : null;
  const personB = answers.personB && typeof answers.personB === "object" ? answers.personB as Record<string, unknown> : null;
  return definition.questions.map((question) => {
    const selectedKey = answers[question.key];
    const selectedOption = question.options.find((option) => option.key === String(selectedKey ?? ""));
    return {
      key: question.key,
      prompt: question.prompt,
      topic: question.topic || "",
      options: question.options.map((option) => ({
        key: option.key,
        label: option.label,
        weights: option.weights.map((weight) => ({ ...weight })),
      })),
      selectedOptionKey: selectedOption?.key || "",
      selectedOption: selectedOption?.label || "",
      personA: personA ? {
        selectedOptionKey: String(personA[question.key] || ""),
        selectedOption: question.options.find((option) => option.key === String(personA[question.key] || ""))?.label || "",
      } : undefined,
      personB: personB ? {
        selectedOptionKey: String(personB[question.key] || ""),
        selectedOption: question.options.find((option) => option.key === String(personB[question.key] || ""))?.label || "",
      } : undefined,
    };
  });
}

export function normalizeTTTCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function isValidTTTCode(value: string) {
  return /^TTT-[A-Z2-9]{5}$/.test(normalizeTTTCode(value));
}

export function createTTTCode() {
  return `TTT-${Array.from({ length: 5 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("")}`;
}

export function createUniqueTTTCode(
  isTaken: (code: string) => boolean,
  generator: () => string = createTTTCode,
  maxAttempts = 5,
) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const code = generator();
    if (!isTaken(code)) return code;
  }

  throw new Error("Không thể tạo mã TTT duy nhất.");
}

function makeSnapshot({
  definition,
  result,
  trend,
  tttCode,
  submittedAt,
}: {
  definition: TestDefinition;
  result: EvaluationResponse;
  trend?: TrendProfile;
  tttCode: string;
  submittedAt: string;
}): PublicTestResult {
  return {
    tttCode,
    testSlug: definition.slug,
    version: definition.version,
    submittedAt,
    resultKey: result.resultKey,
    title: trend?.title || result.title,
    tagline: trend?.tagline || result.profile?.subtitle || "Một góc nhìn để bắt đầu cuộc trò chuyện.",
    summary: trend?.description || result.summary,
    icon: trend?.icon || "✦",
    scores: result.scores,
    score: result.score,
    strengths: trend?.strengths || result.profile?.strengths || [],
    watchouts: trend?.watchouts || result.profile?.watchouts || [],
    suggestions: result.profile?.suggestions || [],
    conversationPrompt: trend?.conversationPrompts[0] || result.profile?.conversationPrompt || "Bạn muốn chia sẻ điều gì đầu tiên từ kết quả này?",
    formulaVersion: result.formulaVersion ?? 2,
    imageChoice: result.imageChoice,
    characterAsset: characterAssetForResult(result.imageChoice, trend),
    personalityCode: result.personalityCode,
    characterId: result.characterId,
    adjustedScores: result.adjustedScores,
  };
}

export function characterAssetForResult(imageChoice: "SUN" | "MOON" | undefined, trend?: TrendProfile) {
  return imageChoice === "SUN" ? trend?.sunAsset : trend?.moonAsset;
}

export async function persistTestSubmission({
  definition,
  respondentName,
  partnerName,
  answers,
  result,
  trend,
  userId,
  sessionId,
  requireDurable = false,
}: {
  definition: TestDefinition;
  respondentName: string;
  partnerName?: string;
  answers: Record<string, unknown>;
  result: EvaluationResponse;
  trend?: TrendProfile;
  userId?: string;
  sessionId?: string;
  requireDurable?: boolean;
}) {
  const cms = await getAppRecordClient();
  const submittedAt = new Date().toISOString();
  const scoringNotes = buildScoringNotes(definition, answers);
  const createSnapshot = (tttCode: string) => makeSnapshot({ definition, result, trend, tttCode, submittedAt });
  const persistLocally = () => {
    const tttCode = createUniqueTTTCode((candidate) => localSubmissions.has(candidate));
    const snapshot = createSnapshot(tttCode);
    localSubmissions.set(tttCode, snapshot);
    return { success: true as const, snapshot };
  };

  if (!cms) return requireDurable ? { success: false as const, durable: false as const } : persistLocally();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const tttCode = createTTTCode();
    let existing;
    try {
      existing = await cms.find({
        collection: "test-submissions",
        where: { tttCode: { equals: tttCode } },
        limit: 1,
        overrideAccess: true,
      });
    } catch {
      markAppDatabaseUnavailable();
      return requireDurable ? { success: false as const, durable: false as const } : persistLocally();
    }
    if (existing.docs[0]) continue;
    const snapshot = createSnapshot(tttCode);

    try {
      await cms.create({
        collection: "test-submissions",
        overrideAccess: true,
        data: {
          respondentName,
          partnerName,
          testSlug: definition.slug,
          testKind: definition.kind,
          resultKey: result.resultKey,
          resultTitle: result.title,
          tttCode,
          resultSnapshot: snapshot,
          imageChoice: result.imageChoice,
          completedAt: submittedAt,
          sessionId,
          top1: result.top1,
          top2: result.top2,
          resultType: result.resultType,
          finalProfile: result.finalProfile ?? result.personalityCode,
          testVersion: result.testVersion ?? definition.version,
          rawScores: result.rawScores,
          adjustedScores: result.adjustedScores,
          personalityCode: result.personalityCode,
          characterId: result.characterId,
          formulaVersion: result.formulaVersion ?? 2,
          user: userId || undefined,
          score: result.score,
          scores: result.scores,
          answers,
          questionSnapshot: buildQuestionSnapshot(definition, answers),
          scoringNotes,
          submittedAt,
        },
      });
      return { success: true, durable: true, snapshot: createSnapshot(tttCode) };
    } catch (error) {
      const errorCode = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      const message = error instanceof Error ? error.message : String(error);
      if (errorCode === "23505" || /unique|duplicate/i.test(message)) continue;
      markAppDatabaseUnavailable();
      return requireDurable ? { success: false as const, durable: false as const } : persistLocally();
    }
  }

  return { success: false as const, durable: true as const };
}

function snapshotFromDoc(doc: Record<string, unknown>): PublicTestResult | null {
  const snapshot = doc.resultSnapshot;
  if (!snapshot || typeof snapshot !== "object") return null;
  const parsed = snapshot as Partial<PublicTestResult>;
  if (typeof parsed.tttCode !== "string" || typeof parsed.testSlug !== "string" || typeof parsed.resultKey !== "string") return null;
  return {
    tttCode: parsed.tttCode,
    testSlug: parsed.testSlug,
    version: Number(parsed.version ?? 1),
    submittedAt: String(parsed.submittedAt ?? doc.submittedAt ?? ""),
    resultKey: parsed.resultKey,
    title: String(parsed.title ?? doc.resultTitle ?? ""),
    tagline: String(parsed.tagline ?? ""),
    summary: String(parsed.summary ?? ""),
    icon: String(parsed.icon ?? "✦"),
    scores: parsed.scores,
    score: typeof parsed.score === "number" ? parsed.score : undefined,
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
    watchouts: Array.isArray(parsed.watchouts) ? parsed.watchouts.map(String) : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String) : [],
    conversationPrompt: String(parsed.conversationPrompt ?? ""),
    formulaVersion: typeof parsed.formulaVersion === "number" ? parsed.formulaVersion : Number(doc.formulaVersion ?? 2),
    imageChoice: parsed.imageChoice === "SUN" || parsed.imageChoice === "MOON" ? parsed.imageChoice : undefined,
    characterAsset: typeof parsed.characterAsset === "string" ? parsed.characterAsset : undefined,
    personalityCode: typeof parsed.personalityCode === "string" ? parsed.personalityCode : undefined,
    characterId: typeof parsed.characterId === "string" ? parsed.characterId : undefined,
    adjustedScores: parsed.adjustedScores,
  };
}

export async function getPublicResultByCode(value: string): Promise<PublicTestResult | null> {
  const code = normalizeTTTCode(value);
  if (!isValidTTTCode(code)) return null;

  const local = localSubmissions.get(code);
  if (local) return local;

  const cms = await getAppRecordClient();
  if (!cms) return null;

  try {
    const result = await cms.find({
      collection: "test-submissions",
      where: { tttCode: { equals: code } },
      limit: 1,
      overrideAccess: true,
    });
    return result.docs[0] ? snapshotFromDoc(result.docs[0] as unknown as Record<string, unknown>) : null;
  } catch {
    markAppDatabaseUnavailable();
    return null;
  }
}

export async function getOwnedResultByCode(value: string, userId: string): Promise<PublicTestResult | null> {
  const code = normalizeTTTCode(value);
  if (!userId || !isValidTTTCode(code)) return null;

  const cms = await getAppRecordClient();
  if (!cms) return null;

  try {
    const result = await cms.find({
      collection: "test-submissions",
      where: { tttCode: { equals: code } },
      limit: 1,
      overrideAccess: true,
    });
    const doc = result.docs[0] as unknown as Record<string, unknown> | undefined;
    if (!doc) return null;
    const owner = doc.user && typeof doc.user === "object" && "id" in doc.user
      ? String((doc.user as { id: unknown }).id)
      : String(doc.user || "");
    if (owner !== userId) return null;
    return snapshotFromDoc(doc);
  } catch {
    markAppDatabaseUnavailable();
    return null;
  }
}
