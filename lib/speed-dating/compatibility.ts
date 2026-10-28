const FINANCE_KEYS = ["security", "experience", "avoidance", "control", "independence"] as const;

export function calculateFinancialSimilarity(scoresA: Record<string, unknown>, scoresB: Record<string, unknown>) {
  const averageDifference = FINANCE_KEYS.reduce((total, key) => total + Math.abs(Number(scoresA[key] ?? 0) - Number(scoresB[key] ?? 0)), 0) / FINANCE_KEYS.length;
  return Math.max(0, Math.min(100, 100 - Math.round(averageDifference)));
}
