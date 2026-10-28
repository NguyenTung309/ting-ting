import { TREND_PROFILES } from "@/lib/trends/catalog";

export const FINANCE_PROFILE_CODES = [
  "S", "P", "A", "C", "I",
  "SP", "SA", "SC", "SI", "PA", "PC", "PI", "AC", "AI", "CI",
] as const;

export type FinanceProfileCode = typeof FINANCE_PROFILE_CODES[number];
export type FinanceResultType = "Pure" | "Hybrid";

export type ResultAnalyticsFilters = {
  startDate?: string;
  endDate?: string;
  resultType?: FinanceResultType | "";
  finalProfile?: FinanceProfileCode | "";
};

export function parseResultAnalyticsFilters(params: URLSearchParams): ResultAnalyticsFilters {
  const startDate = params.get("startDate") || "";
  const endDate = params.get("endDate") || "";
  const rawType = params.get("resultType") || "";
  const rawProfile = params.get("finalProfile") || "";
  return {
    startDate: startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate) ? startDate : undefined,
    endDate: endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate) ? endDate : undefined,
    resultType: rawType === "Pure" || rawType === "Hybrid" ? rawType : undefined,
    finalProfile: PROFILE_SET.has(rawProfile) ? rawProfile as FinanceProfileCode : undefined,
  };
}

export type FinanceAnalyticsRow = {
  id: string;
  testSlug: string;
  completedAt: string;
  userId: string;
  sessionId: string;
  top1: FinanceProfileCode | "";
  top2: FinanceProfileCode | "";
  resultType: FinanceResultType | "";
  finalProfile: FinanceProfileCode | "";
  testVersion: number;
  formulaVersion: number;
  imageChoice: string;
  rawScores: Record<string, number>;
  scores: Record<string, number>;
  answers: Record<string, unknown>;
  respondentName: string;
};

const PROFILE_SET = new Set<string>(FINANCE_PROFILE_CODES);
const TREND_BY_CODE = new Map(TREND_PROFILES.flatMap((trend) => trend.personalityCode ? [[trend.personalityCode, trend] as const] : []));
const DIMENSION_TO_CODE: Record<string, string> = {
  security: "S", experience: "P", avoidance: "A", control: "C", independence: "I",
};
const TREND_NAME_BY_CODE: Record<string, string> = {
  S: "Saver", P: "Spender", A: "Avoider", C: "Controller", I: "Independent",
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown) {
  if (value == null) return "";
  if (typeof value === "object" && "id" in value) return String((value as { id: unknown }).id ?? "");
  return String(value);
}

function scoreMap(value: unknown) {
  const source = record(value);
  return Object.fromEntries(Object.entries(source).map(([key, score]) => [key, Number(score) || 0]));
}

export function normalizeFinanceProfileCode(value: unknown): FinanceProfileCode | "" {
  const input = stringValue(value).trim();
  if (PROFILE_SET.has(input)) return input as FinanceProfileCode;
  const dimensionCode = DIMENSION_TO_CODE[input];
  if (dimensionCode && PROFILE_SET.has(dimensionCode)) return dimensionCode as FinanceProfileCode;
  const trend = TREND_PROFILES.find((item) => item.key === input || item.slug === input);
  return trend?.personalityCode && PROFILE_SET.has(trend.personalityCode) ? trend.personalityCode as FinanceProfileCode : "";
}

export function toFinanceAnalyticsRow(value: Record<string, unknown>): FinanceAnalyticsRow {
  const snapshot = record(value.resultSnapshot);
  const userId = stringValue(value.userId ?? value.user);
  const sessionId = stringValue(value.sessionId ?? value.session_id);
  const finalProfile = normalizeFinanceProfileCode(
    value.finalProfile ?? value.final_profile ?? value.personalityCode ?? snapshot.personalityCode ?? value.resultKey ?? snapshot.resultKey,
  );
  const rawResultType = String(value.resultType ?? value.result_type ?? "").toLowerCase();
  const resultType: FinanceResultType | "" = rawResultType === "pure" ? "Pure"
    : rawResultType === "hybrid" ? "Hybrid"
      : finalProfile ? (finalProfile.length === 1 ? "Pure" : "Hybrid") : "";

  return {
    id: stringValue(value.id),
    testSlug: stringValue(value.testSlug ?? snapshot.testSlug),
    completedAt: stringValue(value.completedAt ?? value.completed_at ?? value.submittedAt ?? snapshot.submittedAt ?? value.createdAt),
    userId,
    sessionId,
    top1: normalizeFinanceProfileCode(value.top1 ?? value.top_1),
    top2: normalizeFinanceProfileCode(value.top2 ?? value.top_2),
    resultType,
    finalProfile,
    testVersion: Number(value.testVersion ?? value.version ?? snapshot.version) || 0,
    formulaVersion: Number(value.formulaVersion ?? snapshot.formulaVersion) || 0,
    imageChoice: stringValue(value.imageChoice ?? snapshot.imageChoice),
    rawScores: scoreMap(value.rawScores ?? snapshot.rawScores),
    scores: scoreMap(value.scores ?? snapshot.scores),
    answers: record(value.answers),
    respondentName: stringValue(value.respondentName),
  };
}

function startOfDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return Number.NaN;
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(timestamp) ? timestamp : Number.NaN;
}

function endOfDayExclusive(value: string) {
  const timestamp = startOfDay(value);
  return Number.isFinite(timestamp) ? timestamp + 24 * 60 * 60 * 1000 : Number.NaN;
}

export function filterFinanceAnalyticsRows(rows: FinanceAnalyticsRow[], filters: ResultAnalyticsFilters = {}) {
  const start = filters.startDate ? startOfDay(filters.startDate) : Number.NEGATIVE_INFINITY;
  const end = filters.endDate ? endOfDayExclusive(filters.endDate) : Number.POSITIVE_INFINITY;
  return rows.filter((row) => {
    if (row.testSlug !== "finance-trend") return false;
    const completed = Date.parse(row.completedAt);
    if (filters.startDate && (!Number.isFinite(start) || !Number.isFinite(completed) || completed < start)) return false;
    if (filters.endDate && (!Number.isFinite(end) || !Number.isFinite(completed) || completed >= end)) return false;
    if (filters.resultType && row.resultType !== filters.resultType) return false;
    if (filters.finalProfile && row.finalProfile !== filters.finalProfile) return false;
    return true;
  });
}

function identityForRows(rows: FinanceAnalyticsRow[]) {
  const sessionUsers = new Map<string, Set<string>>();
  for (const row of rows) {
    if (!row.userId || !row.sessionId) continue;
    const users = sessionUsers.get(row.sessionId) ?? new Set<string>();
    users.add(row.userId);
    sessionUsers.set(row.sessionId, users);
  }

  return (row: FinanceAnalyticsRow) => {
    if (row.userId) return `user:${row.userId}`;
    const linkedUsers = row.sessionId ? sessionUsers.get(row.sessionId) : undefined;
    if (linkedUsers?.size === 1) return `user:${[...linkedUsers][0]}`;
    if (row.sessionId) return `session:${row.sessionId}`;
    return `submission:${row.id}`;
  };
}

function latestRowsByIdentity(rows: FinanceAnalyticsRow[]) {
  const identity = identityForRows(rows);
  const latest = new Map<string, FinanceAnalyticsRow>();
  for (const row of rows) {
    const key = identity(row);
    const current = latest.get(key);
    const currentTime = Date.parse(current?.completedAt || "") || 0;
    const nextTime = Date.parse(row.completedAt) || 0;
    if (!current || nextTime > currentTime || (nextTime === currentTime && row.id.localeCompare(current.id) > 0)) latest.set(key, row);
  }
  return [...latest.values()];
}

function percentage(count: number, total: number) {
  return total ? Math.round((count / total) * 1000) / 10 : 0;
}

export function summarizeFinanceAnalytics(rows: FinanceAnalyticsRow[]) {
  const uniqueRows = latestRowsByIdentity(rows);
  const distributionBase = uniqueRows.filter((row) => row.finalProfile).length;
  const profileDistribution = FINANCE_PROFILE_CODES.map((code) => {
    const profile = TREND_BY_CODE.get(code);
    const count = uniqueRows.filter((row) => row.finalProfile === code).length;
    return {
      code,
      name: profile?.title || code,
      count,
      percentage: percentage(count, distributionBase),
      order: FINANCE_PROFILE_CODES.indexOf(code),
    };
  }).sort((a, b) => b.count - a.count || a.order - b.order).map(({ order: _order, ...profile }) => profile);

  const pureTests = rows.filter((row) => row.resultType === "Pure").length;
  const hybridTests = rows.filter((row) => row.resultType === "Hybrid").length;
  return {
    totalTests: rows.length,
    uniqueUsers: uniqueRows.length,
    pure: { count: pureTests, percentage: percentage(pureTests, rows.length) },
    hybrid: { count: hybridTests, percentage: percentage(hybridTests, rows.length) },
    profileDistribution,
  };
}

function csvCell(value: unknown) {
  let text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function financeAnalyticsCsv(rows: FinanceAnalyticsRow[]) {
  const headers = [
    "completed_at", "user_id", "session_id", "test_slug", "test_version", "formula_version",
    "saver_points", "spender_points", "avoider_points", "controller_points", "independent_points",
    "saver_percent", "spender_percent", "avoider_percent", "controller_percent", "independent_percent",
    "top_1", "top_1_code", "top_2", "top_2_code", "result_type", "final_profile", "final_profile_name", "image_choice",
    ...Array.from({ length: 22 }, (_, index) => `q${index + 1}`),
  ];
  const profileName = (code: string) => TREND_BY_CODE.get(code)?.title || "";
  const keys = ["S", "P", "A", "C", "I"];
  const dimensionKeys = ["security", "experience", "avoidance", "control", "independence"];
  const rowsText = rows.map((row) => [
    row.completedAt, row.userId, row.sessionId, row.testSlug, row.testVersion, row.formulaVersion,
    ...keys.map((key) => row.rawScores[key] ?? 0),
    ...dimensionKeys.map((key) => row.scores[key] ?? 0),
    TREND_NAME_BY_CODE[row.top1] ?? "", row.top1, TREND_NAME_BY_CODE[row.top2] ?? "", row.top2, row.resultType, row.finalProfile,
    profileName(row.finalProfile), row.imageChoice,
    ...Array.from({ length: 22 }, (_, index) => row.answers[`q${index + 1}`] ?? ""),
  ].map(csvCell).join(","));
  return `\uFEFF${[headers.map(csvCell).join(","), ...rowsText].join("\r\n")}`;
}
