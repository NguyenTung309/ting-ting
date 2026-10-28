const FINANCE_DISPLAY_DIMENSIONS = ["security", "experience", "avoidance", "control", "independence"] as const;

export function roundFinancePercentagesToOneDecimal(scores: Record<string, number>) {
  const total = FINANCE_DISPLAY_DIMENSIONS.reduce((sum, key) => sum + Math.max(0, scores[key] ?? 0), 0);
  if (total <= 0) return Object.fromEntries(FINANCE_DISPLAY_DIMENSIONS.map((key) => [key, 0]));

  const exactTenths = FINANCE_DISPLAY_DIMENSIONS.map((key, index) => {
    const exact = (Math.max(0, scores[key] ?? 0) / total) * 1000;
    const floor = Math.floor(exact + 1e-9);
    return { key, index, floor, remainder: exact - floor };
  });
  const remainingTenths = 1000 - exactTenths.reduce((sum, item) => sum + item.floor, 0);
  const remainderOrder = [...exactTenths].sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  const extraTenths = new Set(remainderOrder.slice(0, remainingTenths).map((item) => item.key));

  return Object.fromEntries(exactTenths.map((item) => [item.key, (item.floor + (extraTenths.has(item.key) ? 1 : 0)) / 10]));
}
