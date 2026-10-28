import { describe, expect, it } from "vitest";

import { COMPATIBILITY_TEST, FINANCE_TEST } from "@/lib/tests/default-tests";
import { adjustFinanceScores, evaluateCompatibilityTest, evaluateFinanceScoringV3, evaluateFinanceScoringV4FromDefinition, evaluateFinanceTest, FINANCE_DIMENSION_CODES, FINANCE_QUESTION_CODES, selectFinancePersonalityCode, selectFinancePersonalityCodeV4 } from "@/lib/tests/engine";
import type { FinanceDimensionCode } from "@/lib/tests/engine";
import { roundFinancePercentagesToOneDecimal } from "@/lib/tests/finance-display";
import { coupleAnswersSchema } from "@/lib/tests/types";
import { buildCompatibilityResult } from "@/lib/trends/compatibility";
import { TREND_PROFILES } from "@/lib/trends/catalog";
import { CHARACTER_VARIANTS } from "@/lib/trends/characters";
import { createTTTCode, createUniqueTTTCode, isValidTTTCode } from "@/lib/tests/submissions";
import type { PublicTestResult } from "@/lib/trends/types";

const DIMENSION_KEY_BY_CODE: Record<FinanceDimensionCode, string> = {
  S: "security", P: "experience", A: "avoidance", C: "control", I: "independence",
};

function financeAnswersForCodes(codes: FinanceDimensionCode[], imageChoice: "SUN" | "MOON" = "MOON") {
  if (codes.length !== 22) throw new Error("Expected 22 answer codes.");
  const answers: Record<string, string> = { q0: imageChoice };
  FINANCE_TEST.questions.forEach((question, index) => {
    const option = question.options.find((item) => item.weights.some((weight) => weight.dimensionKey === DIMENSION_KEY_BY_CODE[codes[index]]));
    if (!option) throw new Error(`No option for ${codes[index]} in ${question.key}.`);
    answers[question.key] = option.key;
  });
  return answers;
}

function financeCodesForCounts(counts: Record<FinanceDimensionCode, number>) {
  return FINANCE_DIMENSION_CODES.flatMap((code) => Array.from({ length: counts[code] }, () => code));
}

describe("test engine", () => {
  it("implements scoring v3 with q0 outside the score", () => {
    const answers = Object.fromEntries(Object.keys(FINANCE_QUESTION_CODES).map((key) => [key, "a"]));
    const sun = evaluateFinanceScoringV3({ ...answers, q0: "SUN" });
    const moon = evaluateFinanceScoringV3({ ...answers, q0: "MOON" });
    expect(Object.values(sun.rawScores).reduce((sum, value) => sum + value, 0)).toBe(21);
    expect(sun.rawScores).toEqual(moon.rawScores);
    expect(sun.characterId.startsWith("SUN_")).toBe(true);
    expect(moon.characterId.startsWith("MOON_")).toBe(true);
  });

  it("scores all 22 finance answers as one point each and keeps the image choice score-neutral", () => {
    const answers = financeAnswersForCodes(Array.from({ length: 22 }, () => "S"), "SUN");
    const sun = evaluateFinanceScoringV4FromDefinition(FINANCE_TEST, answers);
    const moon = evaluateFinanceScoringV4FromDefinition(FINANCE_TEST, { ...answers, q0: "MOON" });

    expect(sun.formulaVersion).toBe(4);
    expect(sun.rawScores).toEqual({ S: 22, P: 0, A: 0, C: 0, I: 0 });
    expect(Object.values(sun.rawScores).reduce((total, value) => total + value, 0)).toBe(22);
    expect(Object.values(sun.scores).reduce((total, value) => total + value, 0)).toBeCloseTo(100);
    expect(sun.personalityCode).toBe("S");
    expect([sun.top1, sun.top2]).toEqual(["S", "P"]);
    expect(sun.resultType).toBe("Pure");
    expect(sun.finalProfile).toBe("S");
    expect(sun.testVersion).toBe(FINANCE_TEST.version);
    expect(sun.characterId).toBe("SUN_S");
    expect(moon.rawScores).toEqual(sun.rawScores);
    expect(moon.personalityCode).toBe(sun.personalityCode);
    expect(moon.characterId).toBe("MOON_S");
  });

  it("uses raw-score gaps of two and three for hybrid and pure results", () => {
    const hybrid = evaluateFinanceScoringV4FromDefinition(FINANCE_TEST, financeAnswersForCodes(financeCodesForCounts({ S: 7, P: 5, A: 4, C: 3, I: 3 })));
    const pure = evaluateFinanceScoringV4FromDefinition(FINANCE_TEST, financeAnswersForCodes(financeCodesForCounts({ S: 8, P: 5, A: 3, C: 3, I: 3 })));

    expect(hybrid.personalityCode).toBe("SP");
    expect(pure.personalityCode).toBe("S");
  });

  it("returns a hybrid immediately when exactly two trends tie for the highest score", () => {
    const result = evaluateFinanceScoringV4FromDefinition(FINANCE_TEST, financeAnswersForCodes(financeCodesForCounts({ S: 7, P: 7, A: 3, C: 3, I: 2 })));

    expect(result.personalityCode).toBe("SP");
  });

  it("breaks a three-way highest tie using the 13–17 section first", () => {
    const codes: FinanceDimensionCode[] = [
      "S", "S", "S", "S", "P", "P", "A", "A", "C", "C", "I", "I",
      "P", "A", "P", "A", "S",
      "P", "A", "P", "S", "A",
    ];
    const result = evaluateFinanceScoringV4FromDefinition(FINANCE_TEST, financeAnswersForCodes(codes));

    expect(result.rawScores).toEqual({ S: 6, P: 6, A: 6, C: 2, I: 2 });
    expect(result.personalityCode).toBe("PA");
  });

  it("uses the 18–22 section to rank tied trends when 13–17 is even", () => {
    const codes: FinanceDimensionCode[] = [
      "S", "S", "S", "P", "P", "A", "A", "A", "C", "C", "I", "I",
      "S", "P", "A", "C", "I",
      "P", "P", "S", "A", "C",
    ];
    const result = evaluateFinanceScoringV4FromDefinition(FINANCE_TEST, financeAnswersForCodes(codes));

    expect(result.rawScores).toEqual({ S: 5, P: 5, A: 5, C: 4, I: 3 });
    expect(result.personalityCode).toBe("SP");
  });

  it("uses question 20 as the first single-question tie breaker for second place", () => {
    const codes: FinanceDimensionCode[] = [
      "C", "C", "C", "C", "C", "P", "P", "A", "A", "S", "S", "I",
      "C", "S", "I", "P", "A",
      "P", "A", "P", "I", "A",
    ];
    const result = evaluateFinanceScoringV4FromDefinition(FINANCE_TEST, financeAnswersForCodes(codes));

    expect(result.rawScores).toEqual({ S: 3, P: 5, A: 5, C: 6, I: 3 });
    expect(result.personalityCode).toBe("PC");
  });

  it("uses question 22 before question 21 when the earlier tie-breaks remain even", () => {
    const codes: FinanceDimensionCode[] = [
      "C", "C", "C", "C", "P", "P", "A", "A", "S", "S", "I", "I",
      "C", "S", "I", "P", "A",
      "P", "A", "C", "P", "A",
    ];
    const result = evaluateFinanceScoringV4FromDefinition(FINANCE_TEST, financeAnswersForCodes(codes));

    expect(result.rawScores).toEqual({ S: 3, P: 5, A: 5, C: 6, I: 3 });
    expect(result.personalityCode).toBe("AC");
  });

  it("uses canonical order only when all specified tie-breaks remain tied", () => {
    const codes: FinanceDimensionCode[] = [
      "C", "C", "C", "C", "P", "P", "P", "A", "A", "A", "S", "I",
      "C", "S", "I", "P", "A",
      "P", "A", "C", "S", "I",
    ];
    const result = evaluateFinanceScoringV4FromDefinition(FINANCE_TEST, financeAnswersForCodes(codes));

    expect(result.rawScores).toEqual({ S: 3, P: 5, A: 5, C: 6, I: 3 });
    expect(result.personalityCode).toBe("PC");
  });

  it("rounds displayed percentages to tenths while preserving a 100.0% total", () => {
    const displayed = roundFinancePercentagesToOneDecimal({
      security: (1 / 22) * 100,
      experience: (5 / 22) * 100,
      avoidance: (5 / 22) * 100,
      control: (5 / 22) * 100,
      independence: (6 / 22) * 100,
    });

    expect(displayed).toEqual({ security: 4.6, experience: 22.7, avoidance: 22.7, control: 22.7, independence: 27.3 });
    expect(Object.values(displayed).reduce((total, value) => total + value, 0)).toBeCloseTo(100);
  });

  it("rejects incomplete 22-question answers in scoring v4", () => {
    const answers = financeAnswersForCodes(Array.from({ length: 22 }, () => "S"));
    delete answers.q22;
    expect(() => evaluateFinanceScoringV4FromDefinition(FINANCE_TEST, answers)).toThrow("q22");
  });

  it("requires all q1-q21 answers and the image choice", () => {
    const answers = Object.fromEntries(Object.keys(FINANCE_QUESTION_CODES).map((key) => [key, "a"]));
    expect(() => evaluateFinanceScoringV3({ ...answers, q0: "SUN", q21: "" })).toThrow("q21");
    expect(() => evaluateFinanceScoringV3(answers)).toThrow("SUN");
  });

  it("uses exact adjustment and boundary rules without early rounding", () => {
    expect(adjustFinanceScores({ S: 6, P: 6, A: 0, C: 0, I: 0 }).P).toBe(6.375);
    expect(selectFinancePersonalityCode({ S: 6, P: 6, A: 3, C: 3, I: 3 }, { S: 6, P: 7.5, A: 3.4, C: 3, I: 3 })).toBe("P");
    expect(selectFinancePersonalityCode({ S: 6, P: 6, A: 3, C: 3, I: 3 }, { S: 6, P: 7.49, A: 3.4, C: 3, I: 3 })).toBe("SP");
    expect(selectFinancePersonalityCode({ S: 4, P: 4, A: 4, C: 4, I: 5 }, { S: 4, P: 4, A: 4, C: 4, I: 5 })).toBe("SI");
  });

  it("keeps the v3 answer mapping exact for all 21 questions", () => {
    expect(FINANCE_QUESTION_CODES).toEqual({
      q1: "PICA", q2: "SPCI", q3: "PSAC", q4: "PCAI", q5: "CISP", q6: "AICP", q7: "PSAC",
      q8: "PISC", q9: "SCAI", q10: "PSCI", q11: "CPSA", q12: "ICAS", q13: "CISA", q14: "PCSI",
      q15: "ICSA", q16: "SIPA", q17: "SPIA", q18: "PSCI", q19: "PCAI", q20: "PSAI", q21: "SCAI",
    });
  });

  it("returns only the 15 canonical personality codes", () => {
    const codes = new Set(["S", "P", "A", "C", "I", "SP", "SA", "SC", "SI", "PA", "PC", "PI", "AC", "AI", "CI"]);
    const combinations = [
      ["S", "P"], ["S", "A"], ["S", "C"], ["S", "I"], ["P", "A"], ["P", "C"], ["P", "I"],
      ["A", "C"], ["A", "I"], ["C", "I"],
    ];
    for (const [first, second] of combinations) {
      const adjusted = { S: 0, P: 0, A: 0, C: 0, I: 0 };
      adjusted[first as keyof typeof adjusted] = 5;
      adjusted[second as keyof typeof adjusted] = 4;
      expect(codes.has(selectFinancePersonalityCode(adjusted, adjusted))).toBe(true);

      const raw = { S: 0, P: 0, A: 0, C: 0, I: 0 };
      raw[first as keyof typeof raw] = 7;
      raw[second as keyof typeof raw] = 7;
      const rest = FINANCE_DIMENSION_CODES.filter((code) => code !== first && code !== second);
      raw[rest[0]] = 3;
      raw[rest[1]] = 3;
      raw[rest[2]] = 2;
      expect(codes.has(selectFinancePersonalityCodeV4(raw, {}))).toBe(true);
    }
  });

  it("returns the strongest finance dimension", () => {
    const answers = Object.fromEntries(FINANCE_TEST.questions.map((question) => [
      question.key,
      question.options.find((option) => option.weights.some((weight) => weight.dimensionKey === "security"))?.key || question.options[0].key,
    ]));
    const result = evaluateFinanceTest(FINANCE_TEST, answers);

    expect(result.resultKey).toBe("security");
    expect(result.scores?.security).toBeGreaterThan(result.scores?.experience ?? 0);
  });

  it("rejects incomplete answers", () => {
    expect(() => evaluateFinanceTest(FINANCE_TEST, { q1: "save" })).toThrow("Câu trả lời không hợp lệ");
  });

  it("scores identical compatibility answers at 100", () => {
    const answers = { q1: "a", q2: "b", q3: "c", q4: "a" };
    const result = evaluateCompatibilityTest(COMPATIBILITY_TEST, answers, answers);

    expect(result.score).toBe(100);
    expect(result.resultKey).toBe("spark");
  });

  it("keeps compatibility scoring symmetric when people swap places", () => {
    const personA = { q1: "a", q2: "b", q3: "c", q4: "a" };
    const personB = { q1: "b", q2: "c", q3: "c", q4: "b" };

    const first = evaluateCompatibilityTest(COMPATIBILITY_TEST, personA, personB);
    const second = evaluateCompatibilityTest(COMPATIBILITY_TEST, personB, personA);

    expect(second.score).toBe(first.score);
    expect(second.resultKey).toBe(first.resultKey);
  });

  it("validates the pair input shape with Zod", () => {
    expect(coupleAnswersSchema.safeParse({ personA: {}, personB: {} }).success).toBe(true);
    expect(coupleAnswersSchema.safeParse({ personA: "wrong", personB: {} }).success).toBe(false);
  });

  it("creates valid non-ambiguous TTT codes", () => {
    expect(isValidTTTCode(createTTTCode())).toBe(true);
  });

  it("retries TTT code collisions", () => {
    const generated = ["TTT-AAAAA", "TTT-BBBBB"];
    const code = createUniqueTTTCode((candidate) => candidate === "TTT-AAAAA", () => generated.shift() || "TTT-CCCCC");
    expect(code).toBe("TTT-BBBBB");
  });

  it("keeps the launch catalog at five base and ten hybrid trends", () => {
    expect(TREND_PROFILES.filter((trend) => trend.kind === "base")).toHaveLength(5);
    expect(TREND_PROFILES.filter((trend) => trend.kind === "hybrid")).toHaveLength(10);
    expect(CHARACTER_VARIANTS).toHaveLength(30);
    expect(new Set(CHARACTER_VARIANTS.map((item) => item.characterId)).size).toBe(30);
  });

  it("calculates symmetric compatibility and ranks close dimensions", () => {
    const result = (scores: Record<string, number>, code: string): PublicTestResult => ({
      tttCode: code,
      testSlug: "finance-trend",
      version: 2,
      submittedAt: "2026-09-24T00:00:00.000Z",
      resultKey: "security",
      title: "Người xây nền",
      tagline: "An tâm trước, đi xa sau.",
      summary: "summary",
      icon: "◒",
      scores,
      strengths: [],
      watchouts: [],
      suggestions: [],
      conversationPrompt: "prompt",
    });
    const trends = new Map(TREND_PROFILES.map((trend) => [trend.key, trend]));
    const first = buildCompatibilityResult(result({ security: 90, experience: 50, avoidance: 20, control: 60, independence: 10 }, "TTT-AAAAA"), result({ security: 80, experience: 55, avoidance: 30, control: 20, independence: 90 }, "TTT-BBBBB"), trends);
    const second = buildCompatibilityResult(first.personB, first.personA, trends);
    expect(first.score).toBe(second.score);
    expect(first.closeDimensions[0]?.key).toBe("experience");
    expect(first.distantDimensions[0]?.key).toBe("independence");
  });
});
