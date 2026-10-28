import { z } from "zod";
import type { TrendProfile, PublicTestResult } from "@/lib/trends/types";

const scoreSchema = z.object({
  dimensionKey: z.string().min(1),
  points: z.number(),
});

const optionSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  weights: z.array(scoreSchema).default([]),
});

const pairMatrixSchema = z.object({
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  points: z.number().min(0).max(100),
});

const stringListSchema = z.array(z.union([
  z.string(),
  z.object({ text: z.string().min(1) }),
])).transform((items) => items.map((item) => typeof item === "string" ? item : item.text));

export const testDefinitionSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  slug: z.string().min(1),
  kind: z.enum(["finance", "compatibility"]),
  version: z.number().int().positive(),
  status: z.enum(["draft", "published"]),
  title: z.string().min(1),
  description: z.string(),
  intro: z.string().default(""),
  estimatedMinutes: z.number().int().positive().default(5),
  note: z.string().default(""),
  dimensions: z.array(z.object({ key: z.string().min(1), label: z.string().min(1) })).default([]),
  questions: z.array(z.object({
    key: z.string().min(1),
    prompt: z.string().min(1),
    topic: z.string().nullish(),
    options: z.array(optionSchema).min(2),
    pairMatrix: z.array(pairMatrixSchema).default([]),
  })).min(1),
  resultProfiles: z.array(z.object({
    key: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().default(""),
    summary: z.string(),
    conversationPrompt: z.string().default(""),
    strengths: stringListSchema.default([]),
    watchouts: stringListSchema.default([]),
    suggestions: stringListSchema.default([]),
    dimensionKey: z.string().nullish(),
    minScore: z.number().default(0),
    maxScore: z.number().default(100),
    priority: z.number().default(0),
    fallback: z.boolean().default(false),
  })).min(1),
});

export type TestDefinition = z.infer<typeof testDefinitionSchema>;
export type Question = TestDefinition["questions"][number];
export type TestResult = TestDefinition["resultProfiles"][number];

export type EvaluationResponse = {
  testSlug: string;
  version: number;
  resultKey: string;
  title: string;
  summary: string;
  scores?: Record<string, number>;
  score?: number;
  tttCode?: string;
  submittedAt?: string;
  trend?: TrendProfile;
  profile?: {
    subtitle: string;
    conversationPrompt: string;
    strengths: string[];
    watchouts: string[];
    suggestions: string[];
  };
  formulaVersion?: number;
  imageChoice?: "SUN" | "MOON";
  personalityCode?: string;
  characterId?: string;
  rawScores?: Record<string, number>;
  adjustedScores?: Record<string, number>;
  top1?: string;
  top2?: string;
  resultType?: "Pure" | "Hybrid";
  finalProfile?: string;
  testVersion?: number;
};

export type FinanceImageChoice = "SUN" | "MOON";
export type FinanceDimensionCode = "S" | "P" | "A" | "C" | "I";
export type FinancePersonalityCode = "S" | "P" | "A" | "C" | "I" | "SP" | "SA" | "SC" | "SI" | "PA" | "PC" | "PI" | "AC" | "AI" | "CI";

export type FinanceScoringV3Result = EvaluationResponse & {
  formulaVersion: 3;
  imageChoice: FinanceImageChoice;
  personalityCode: FinancePersonalityCode;
  characterId: `${FinanceImageChoice}_${FinancePersonalityCode}`;
  rawScores: Record<string, number>;
  adjustedScores: Record<string, number>;
};

export type FinanceScoringV4Result = EvaluationResponse & {
  formulaVersion: 4;
  imageChoice: FinanceImageChoice;
  personalityCode: FinancePersonalityCode;
  characterId: `${FinanceImageChoice}_${FinancePersonalityCode}`;
  rawScores: Record<string, number>;
  scores: Record<string, number>;
  top1: FinanceDimensionCode;
  top2: FinanceDimensionCode;
  resultType: "Pure" | "Hybrid";
  finalProfile: FinancePersonalityCode;
  testVersion: number;
};

export type StoredPublicResult = PublicTestResult;

export const answersSchema = z.record(z.string(), z.string());

export const personNameSchema = z.string().trim().min(2, "Tên cần có ít nhất 2 ký tự.").max(80, "Tên không được dài quá 80 ký tự.");

export const financeEvaluationRequestSchema = z.object({
  respondentName: personNameSchema.optional().default("Ẩn danh"),
  imageChoice: z.enum(["SUN", "MOON"]).optional(),
  answers: answersSchema,
}).superRefine((value, ctx) => {
  const imageChoice = value.imageChoice ?? value.answers.q0;
  if (imageChoice !== "SUN" && imageChoice !== "MOON") {
    ctx.addIssue({ code: "custom", path: ["imageChoice"], message: "Cần chọn hình ảnh SUN hoặc MOON." });
  }
});

export const coupleAnswersSchema = z.object({
  personA: answersSchema,
  personB: answersSchema,
});

export const coupleEvaluationRequestSchema = coupleAnswersSchema.extend({
  personAName: personNameSchema,
  personBName: personNameSchema,
});
