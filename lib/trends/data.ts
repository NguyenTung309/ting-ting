import { TREND_PROFILES, getFallbackTrend } from "./catalog";
import type { TrendProfile } from "./types";

export async function getAllPublishedTrends(): Promise<TrendProfile[]> {
  return TREND_PROFILES.filter((trend) => trend.status === "published");
}

export async function getPublishedTrends(): Promise<TrendProfile[]> {
  return TREND_PROFILES;
}

export async function getPublishedTrendBySlug(slug: string): Promise<TrendProfile | null> {
  return TREND_PROFILES.find((trend) => trend.slug === slug) ?? null;
}

export async function getPublishedTrendByKey(key: string): Promise<TrendProfile | null> {
  return getFallbackTrend(key) ?? null;
}

export async function getPublishedTrendsByKeys(keys: string[]): Promise<TrendProfile[]> {
  const byKey = new Map(TREND_PROFILES.map((trend) => [trend.key, trend]));
  return keys.map((key) => byKey.get(key)).filter((trend): trend is TrendProfile => Boolean(trend));
}
