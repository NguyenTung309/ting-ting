import type { CompatibilityDimension, CompatibilityResult, PublicTestResult, TrendProfile } from "./types";

export function buildCompatibilityResult(personA: PublicTestResult, personB: PublicTestResult, trends: Map<string, TrendProfile | null>): CompatibilityResult {
  const keys = Array.from(new Set([...Object.keys(personA.scores ?? {}), ...Object.keys(personB.scores ?? {})]));
  const dimensions: CompatibilityDimension[] = keys.map((key) => ({
    key,
    label: trends.get(key)?.title ?? key,
    difference: Math.abs((personA.scores?.[key] ?? 0) - (personB.scores?.[key] ?? 0)),
    scoreA: personA.scores?.[key] ?? 0,
    scoreB: personB.scores?.[key] ?? 0,
    trend: trends.get(key) ?? undefined,
  }));
  const score = Math.max(0, Math.min(100, 100 - Math.round(dimensions.reduce((total, dimension) => total + dimension.difference, 0) / Math.max(dimensions.length, 1))));
  const closeDimensions = [...dimensions].sort((a, b) => a.difference - b.difference).slice(0, 3);
  const distantDimensions = [...dimensions].sort((a, b) => b.difference - a.difference).slice(0, 2);
  const suggestions = distantDimensions.map((dimension) => dimension.trend?.frictionReason).filter((item): item is string => Boolean(item));
  const prompts = [...new Set([
    ...closeDimensions.flatMap((dimension) => dimension.trend?.conversationPrompts ?? []),
    ...distantDimensions.flatMap((dimension) => dimension.trend?.conversationPrompts ?? []),
  ])].slice(0, 3);

  return {
    score,
    personA,
    personB,
    closeDimensions,
    distantDimensions,
    suggestions: suggestions.length ? suggestions : ["Chọn một khác biệt nhỏ và nói về điều mỗi người cần để thấy thoải mái hơn."],
    prompts: prompts.length ? prompts : ["Trong chuyện tiền bạc, điều gì khiến bạn cảm thấy được lắng nghe?"],
    sharedDimensions: closeDimensions,
    differentDimensions: distantDimensions,
  };
}
