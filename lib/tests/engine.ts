import type { EvaluationResponse, FinanceImageChoice, FinancePersonalityCode, FinanceScoringV3Result, FinanceScoringV4Result, TestDefinition } from "./types";

export const FINANCE_DIMENSION_CODES = ["S", "P", "A", "C", "I"] as const;
export type FinanceDimensionCode = typeof FINANCE_DIMENSION_CODES[number];
export const FINANCE_QUESTION_COUNT = 22;

export const FINANCE_QUESTION_CODES: Record<string, string> = {
  q1: "PICA", q2: "SPCI", q3: "PSAC", q4: "PCAI", q5: "CISP", q6: "AICP", q7: "PSAC",
  q8: "PISC", q9: "SCAI", q10: "PSCI", q11: "CPSA", q12: "ICAS", q13: "CISA", q14: "PCSI",
  q15: "ICSA", q16: "SIPA", q17: "SPIA", q18: "PSCI", q19: "PCAI", q20: "PSAI", q21: "SCAI",
};

const ADJUSTMENT_FACTORS: Record<FinanceDimensionCode, number> = { S: 17 / 17, P: 17 / 16, A: 17 / 15, C: 17 / 18, I: 17 / 18 };
const DIMENSION_ORDER = new Map(FINANCE_DIMENSION_CODES.map((code, index) => [code, index]));
const FINANCE_DIMENSION_BY_KEY: Record<string, FinanceDimensionCode> = {
  security: "S",
  experience: "P",
  avoidance: "A",
  control: "C",
  independence: "I",
};

export function adjustFinanceScores(rawScores: Record<string, number>) {
  return Object.fromEntries(FINANCE_DIMENSION_CODES.map((code) => [code, (rawScores[code] ?? 0) * ADJUSTMENT_FACTORS[code]])) as Record<FinanceDimensionCode, number>;
}

export function normalizeFinanceScores(adjustedScores: Record<string, number>) {
  const max = Math.max(...FINANCE_DIMENSION_CODES.map((code) => adjustedScores[code] ?? 0), 1);
  return Object.fromEntries(FINANCE_DIMENSION_CODES.map((code) => [code, Math.round(((adjustedScores[code] ?? 0) / max) * 100)]));
}

export function selectFinancePersonalityCode(rawScores: Record<string, number>, adjustedScores: Record<string, number>): FinancePersonalityCode {
  const ranked = [...FINANCE_DIMENSION_CODES].sort((a, b) => {
    const adjustedDifference = (adjustedScores[b] ?? 0) - (adjustedScores[a] ?? 0);
    if (adjustedDifference !== 0) return adjustedDifference;
    const rawDifference = (rawScores[b] ?? 0) - (rawScores[a] ?? 0);
    return rawDifference !== 0 ? rawDifference : (DIMENSION_ORDER.get(a) ?? 0) - (DIMENSION_ORDER.get(b) ?? 0);
  });
  const top = ranked[0];
  const second = ranked[1];
  if (adjustedScores[top] - adjustedScores[second] >= 1.5) return top;

  // Hybrid codes are canonical and always follow S → P → A → C → I,
  // independent of which dimension ranked first by score.
  const hybrid = [top, second].sort((a, b) => (DIMENSION_ORDER.get(a) ?? 0) - (DIMENSION_ORDER.get(b) ?? 0)).join("");
  return hybrid as FinancePersonalityCode;
}

function validateFinanceV3Answers(answers: Record<string, string>, imageChoice?: FinanceImageChoice) {
  const selectedImage = imageChoice ?? answers.q0;
  if (selectedImage !== "SUN" && selectedImage !== "MOON") throw new Error("Cần chọn hình ảnh SUN hoặc MOON.");

  for (const question of Object.keys(FINANCE_QUESTION_CODES)) {
    if (!/^[a-d]$/.test(answers[question] ?? "")) throw new Error(`Câu trả lời không hợp lệ cho ${question}`);
  }
  return selectedImage;
}

export function evaluateFinanceScoringV3(answers: Record<string, string>, imageChoice?: FinanceImageChoice): FinanceScoringV3Result {
  const selectedImage = validateFinanceV3Answers(answers, imageChoice);
  const rawScores = Object.fromEntries(FINANCE_DIMENSION_CODES.map((code) => [code, 0])) as Record<FinanceDimensionCode, number>;
  for (const [question, answer] of Object.entries(FINANCE_QUESTION_CODES)) {
    const code = answer[answer ? (answers[question].charCodeAt(0) - 97) : 0] as FinanceDimensionCode;
    rawScores[code] += 1;
  }
  const rawTotal = Object.values(rawScores).reduce((total, value) => total + value, 0);
  if (rawTotal !== 21) throw new Error("Tổng điểm thô không hợp lệ.");

  const adjustedScores = adjustFinanceScores(rawScores);
  const personalityCode = selectFinancePersonalityCode(rawScores, adjustedScores);
  const characterId = `${selectedImage}_${personalityCode}` as `${FinanceImageChoice}_${FinancePersonalityCode}`;

  return {
    testSlug: "finance-trend",
    version: 3,
    formulaVersion: 3,
    resultKey: personalityCode,
    title: `Xu hướng ${personalityCode}`,
    summary: "Kết quả được tính từ 21 câu hỏi về cách bạn tương tác với tiền trong mối quan hệ.",
    imageChoice: selectedImage,
    personalityCode,
    characterId,
    rawScores,
    adjustedScores,
    scores: normalizeFinanceScores(adjustedScores),
    profile: { subtitle: personalityCode, conversationPrompt: "Bạn muốn chia sẻ điều gì đầu tiên từ kết quả này?", strengths: [], watchouts: [], suggestions: [] },
  };
}

export function evaluateFinanceScoringV3FromDefinition(
  definition: TestDefinition,
  answers: Record<string, string>,
  imageChoice?: FinanceImageChoice,
): FinanceScoringV3Result {
  const selectedImage = imageChoice ?? answers.q0;
  if (selectedImage !== "SUN" && selectedImage !== "MOON") throw new Error("Cần chọn hình ảnh SUN hoặc MOON.");
  requiredAnswers(definition, answers);

  const rawScores = Object.fromEntries(FINANCE_DIMENSION_CODES.map((code) => [code, 0])) as Record<FinanceDimensionCode, number>;
  const maximumScores = Object.fromEntries(FINANCE_DIMENSION_CODES.map((code) => [code, 0])) as Record<FinanceDimensionCode, number>;

  for (const question of definition.questions) {
    const selectedOption = question.options.find((option) => option.key === answers[question.key]);
    const possibleScores = Object.fromEntries(FINANCE_DIMENSION_CODES.map((code) => [code, 0])) as Record<FinanceDimensionCode, number>;
    for (const option of question.options) {
      const optionScores = Object.fromEntries(FINANCE_DIMENSION_CODES.map((code) => [code, 0])) as Record<FinanceDimensionCode, number>;
      for (const weight of option.weights) {
        const code = FINANCE_DIMENSION_BY_KEY[weight.dimensionKey];
        if (!code) throw new Error(`Nhóm điểm không hợp lệ: ${weight.dimensionKey}`);
        optionScores[code] += weight.points;
      }
      for (const code of FINANCE_DIMENSION_CODES) possibleScores[code] = Math.max(possibleScores[code], optionScores[code]);
    }

    for (const code of FINANCE_DIMENSION_CODES) maximumScores[code] += possibleScores[code];
    for (const weight of selectedOption?.weights ?? []) {
      const code = FINANCE_DIMENSION_BY_KEY[weight.dimensionKey];
      if (!code) throw new Error(`Nhóm điểm không hợp lệ: ${weight.dimensionKey}`);
      rawScores[code] += weight.points;
    }
  }

  const adjustedScores = Object.fromEntries(FINANCE_DIMENSION_CODES.map((code) => {
    const maximum = maximumScores[code] ?? 0;
    const adjustment = maximum > 0 ? definition.questions.length / maximum : 1;
    return [code, (rawScores[code] ?? 0) * adjustment];
  })) as Record<FinanceDimensionCode, number>;
  const personalityCode = selectFinancePersonalityCode(rawScores, adjustedScores);
  const characterId = `${selectedImage}_${personalityCode}` as `${FinanceImageChoice}_${FinancePersonalityCode}`;

  return {
    testSlug: definition.slug,
    version: definition.version,
    formulaVersion: 3,
    resultKey: personalityCode,
    title: `Xu hướng ${personalityCode}`,
    summary: `Kết quả được tính từ ${definition.questions.length} câu hỏi về cách bạn tương tác với tiền trong mối quan hệ.`,
    imageChoice: selectedImage,
    personalityCode,
    characterId,
    rawScores,
    adjustedScores,
    scores: normalizeFinanceScores(adjustedScores),
    profile: { subtitle: personalityCode, conversationPrompt: "Bạn muốn chia sẻ điều gì đầu tiên từ kết quả này?", strengths: [], watchouts: [], suggestions: [] },
  };
}

function financeV4Questions(definition: TestDefinition) {
  if (definition.questions.length !== FINANCE_QUESTION_COUNT) {
    throw new Error(`Bài test tài chính cần có đúng ${FINANCE_QUESTION_COUNT} câu.`);
  }

  const questions = new Map<number, TestDefinition["questions"][number]>();
  for (const question of definition.questions) {
    const match = /^q(\d+)$/.exec(question.key);
    const questionNumber = match ? Number(match[1]) : 0;
    if (questionNumber < 1 || questionNumber > FINANCE_QUESTION_COUNT || questions.has(questionNumber)) {
      throw new Error(`Mã câu hỏi tài chính không hợp lệ: ${question.key}`);
    }
    if (question.options.length !== FINANCE_DIMENSION_CODES.length) {
      throw new Error(`${question.key} cần có đúng 5 lựa chọn tương ứng với 5 xu hướng.`);
    }

    const optionCodes = question.options.map((option) => {
      if (option.weights.length !== 1 || option.weights[0]?.points !== 1) {
        throw new Error(`${question.key} cần cộng đúng 1 điểm cho một xu hướng.`);
      }
      const code = FINANCE_DIMENSION_BY_KEY[option.weights[0].dimensionKey];
      if (!code) throw new Error(`Nhóm điểm không hợp lệ: ${option.weights[0].dimensionKey}`);
      return code;
    });
    if (new Set(optionCodes).size !== FINANCE_DIMENSION_CODES.length) {
      throw new Error(`${question.key} phải có đúng một lựa chọn cho mỗi xu hướng.`);
    }
    questions.set(questionNumber, question);
  }

  for (let questionNumber = 1; questionNumber <= FINANCE_QUESTION_COUNT; questionNumber += 1) {
    if (!questions.has(questionNumber)) throw new Error(`Thiếu câu hỏi q${questionNumber}.`);
  }
  return questions;
}

function financeTieBreak(candidates: FinanceDimensionCode[], answerCodes: Record<string, FinanceDimensionCode>) {
  const countAnswers = (code: FinanceDimensionCode, start: number, end: number) => {
    let count = 0;
    for (let questionNumber = start; questionNumber <= end; questionNumber += 1) {
      if (answerCodes[`q${questionNumber}`] === code) count += 1;
    }
    return count;
  };

  return [...candidates].sort((a, b) => {
    const section13To17 = countAnswers(b, 13, 17) - countAnswers(a, 13, 17);
    if (section13To17 !== 0) return section13To17;

    const section18To22 = countAnswers(b, 18, 22) - countAnswers(a, 18, 22);
    if (section18To22 !== 0) return section18To22;

    const finalQuestionCount = countAnswers(b, 20, 22) - countAnswers(a, 20, 22);
    if (finalQuestionCount !== 0) return finalQuestionCount;

    for (const questionNumber of [20, 22, 21]) {
      const selectedCode = answerCodes[`q${questionNumber}`];
      if (selectedCode === a && selectedCode !== b) return -1;
      if (selectedCode === b && selectedCode !== a) return 1;
    }

    // This last resort only makes a fully indistinguishable tie deterministic.
    return (DIMENSION_ORDER.get(a) ?? 0) - (DIMENSION_ORDER.get(b) ?? 0);
  });
}

function hybridFinanceCode(a: FinanceDimensionCode, b: FinanceDimensionCode): FinancePersonalityCode {
  return [a, b].sort((left, right) => (DIMENSION_ORDER.get(left) ?? 0) - (DIMENSION_ORDER.get(right) ?? 0)).join("") as FinancePersonalityCode;
}

export function rankFinanceDimensionsV4(
  rawScores: Record<FinanceDimensionCode, number>,
  answerCodes: Record<string, FinanceDimensionCode>,
): [FinanceDimensionCode, FinanceDimensionCode] {
  const ordered = [...FINANCE_DIMENSION_CODES].sort((a, b) => rawScores[b] - rawScores[a] || (DIMENSION_ORDER.get(a) ?? 0) - (DIMENSION_ORDER.get(b) ?? 0));
  const highestScore = rawScores[ordered[0]];
  const tiedHighest = ordered.filter((code) => rawScores[code] === highestScore);

  if (tiedHighest.length === 2) return [tiedHighest[0], tiedHighest[1]];
  if (tiedHighest.length > 2) {
    const [first, second] = financeTieBreak(tiedHighest, answerCodes);
    return [first, second];
  }

  const top = tiedHighest[0];
  const secondScore = rawScores[ordered[1]];
  const tiedSecond = ordered.filter((code) => code !== top && rawScores[code] === secondScore);
  const second = tiedSecond.length > 1 ? financeTieBreak(tiedSecond, answerCodes)[0] : tiedSecond[0];
  return [top, second];
}

export function selectFinancePersonalityCodeV4(
  rawScores: Record<FinanceDimensionCode, number>,
  answerCodes: Record<string, FinanceDimensionCode>,
): FinancePersonalityCode {
  const [top, second] = rankFinanceDimensionsV4(rawScores, answerCodes);
  return rawScores[top] - rawScores[second] >= 3 ? top : hybridFinanceCode(top, second);
}

export function evaluateFinanceScoringV4FromDefinition(
  definition: TestDefinition,
  answers: Record<string, string>,
  imageChoice?: FinanceImageChoice,
): FinanceScoringV4Result {
  const selectedImage = imageChoice ?? answers.q0;
  if (selectedImage !== "SUN" && selectedImage !== "MOON") throw new Error("Cần chọn hình ảnh SUN hoặc MOON.");
  requiredAnswers(definition, answers);
  const questions = financeV4Questions(definition);

  const rawScores = Object.fromEntries(FINANCE_DIMENSION_CODES.map((code) => [code, 0])) as Record<FinanceDimensionCode, number>;
  const answerCodes: Record<string, FinanceDimensionCode> = {};
  for (let questionNumber = 1; questionNumber <= FINANCE_QUESTION_COUNT; questionNumber += 1) {
    const question = questions.get(questionNumber)!;
    const selectedOption = question.options.find((option) => option.key === answers[question.key])!;
    const code = FINANCE_DIMENSION_BY_KEY[selectedOption.weights[0].dimensionKey];
    rawScores[code] += 1;
    answerCodes[question.key] = code;
  }

  const rawTotal = FINANCE_DIMENSION_CODES.reduce((total, code) => total + rawScores[code], 0);
  if (rawTotal !== FINANCE_QUESTION_COUNT) throw new Error("Tổng điểm thô không hợp lệ.");

  const [top1, top2] = rankFinanceDimensionsV4(rawScores, answerCodes);
  const personalityCode = selectFinancePersonalityCodeV4(rawScores, answerCodes);
  const dimensionKeyByCode: Record<FinanceDimensionCode, string> = {
    S: "security", P: "experience", A: "avoidance", C: "control", I: "independence",
  };
  const scores = Object.fromEntries(FINANCE_DIMENSION_CODES.map((code) => [
    dimensionKeyByCode[code], (rawScores[code] / FINANCE_QUESTION_COUNT) * 100,
  ]));
  const characterId = `${selectedImage}_${personalityCode}` as `${FinanceImageChoice}_${FinancePersonalityCode}`;

  return {
    testSlug: definition.slug,
    version: definition.version,
    formulaVersion: 4,
    resultKey: personalityCode,
    title: `Xu hướng ${personalityCode}`,
    summary: `Kết quả được tính từ ${FINANCE_QUESTION_COUNT} câu hỏi về cách bạn tương tác với tiền trong mối quan hệ.`,
    imageChoice: selectedImage,
    personalityCode,
    characterId,
    rawScores,
    scores,
    top1,
    top2,
    resultType: personalityCode.length === 1 ? "Pure" : "Hybrid",
    finalProfile: personalityCode,
    testVersion: definition.version,
    profile: { subtitle: personalityCode, conversationPrompt: "Bạn muốn chia sẻ điều gì đầu tiên từ kết quả này?", strengths: [], watchouts: [], suggestions: [] },
  };
}

function requiredAnswers(definition: TestDefinition, answers: Record<string, string>) {
  for (const question of definition.questions) {
    const answer = answers[question.key];
    if (!answer || !question.options.some((option) => option.key === answer)) {
      throw new Error(`Câu trả lời không hợp lệ cho ${question.key}`);
    }
  }
}

function resolveResult(definition: TestDefinition, score: number, dimensionKey?: string) {
  const candidates = [...definition.resultProfiles]
    .filter((profile) => !profile.fallback)
    .sort((a, b) => b.priority - a.priority);

  const result = candidates.find((profile) => {
    const matchesDimension = !profile.dimensionKey || profile.dimensionKey === dimensionKey;
    return matchesDimension && score >= profile.minScore && score <= profile.maxScore;
  });

  return result ?? definition.resultProfiles.find((profile) => profile.fallback) ?? definition.resultProfiles[0];
}

function profileDetails(profile: TestDefinition["resultProfiles"][number]) {
  return {
    subtitle: profile.subtitle,
    conversationPrompt: profile.conversationPrompt,
    strengths: profile.strengths,
    watchouts: profile.watchouts,
    suggestions: profile.suggestions,
  };
}

export function evaluateFinanceTest(
  definition: TestDefinition,
  answers: Record<string, string>,
): EvaluationResponse {
  requiredAnswers(definition, answers);

  const rawScores = Object.fromEntries(definition.dimensions.map((dimension) => [dimension.key, 0]));
  const maximumScores = Object.fromEntries(definition.dimensions.map((dimension) => [dimension.key, 0]));

  for (const question of definition.questions) {
    const option = question.options.find((item) => item.key === answers[question.key]);
    for (const weight of option?.weights ?? []) {
      rawScores[weight.dimensionKey] = (rawScores[weight.dimensionKey] ?? 0) + weight.points;
    }

    for (const dimension of definition.dimensions) {
      const possible = Math.max(
        ...question.options.map((item) => item.weights
          .filter((weight) => weight.dimensionKey === dimension.key)
          .reduce((total, weight) => total + weight.points, 0)),
        0,
      );
      maximumScores[dimension.key] = (maximumScores[dimension.key] ?? 0) + possible;
    }
  }

  const scores = Object.fromEntries(
    definition.dimensions.map((dimension) => {
      const maximum = maximumScores[dimension.key] ?? 0;
      const raw = rawScores[dimension.key] ?? 0;
      return [dimension.key, maximum > 0 ? Math.round((raw / maximum) * 100) : 0];
    }),
  );

  const [dimensionKey, score] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0] ?? [undefined, 0];
  const result = resolveResult(definition, score, dimensionKey);

  return {
    testSlug: definition.slug,
    version: definition.version,
    resultKey: result.key,
    title: result.title,
    summary: result.summary,
    scores,
    profile: profileDetails(result),
  };
}

function pairKey(a: string, b: string) {
  return [a, b].sort().join("::");
}

export function evaluateCompatibilityTest(
  definition: TestDefinition,
  personA: Record<string, string>,
  personB: Record<string, string>,
): EvaluationResponse {
  requiredAnswers(definition, personA);
  requiredAnswers(definition, personB);

  const points = definition.questions.map((question) => {
    const answerA = personA[question.key];
    const answerB = personB[question.key];
    const pair = question.pairMatrix.find((item) => pairKey(item.optionA, item.optionB) === pairKey(answerA, answerB));
    if (!pair) throw new Error(`Thiếu điểm tương thích cho ${question.key}`);
    return pair.points;
  });

  const score = Math.round(points.reduce((total, value) => total + value, 0) / points.length);
  const result = resolveResult(definition, score);

  return {
    testSlug: definition.slug,
    version: definition.version,
    resultKey: result.key,
    title: result.title,
    summary: result.summary,
    score,
    profile: profileDetails(result),
  };
}
