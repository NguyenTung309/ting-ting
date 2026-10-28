import { randomUUID } from "node:crypto";

import type { DiscoveryCandidate, DiscoveryProfile, DiscoveryBatch } from "./types";

export function rankCandidates(candidates: DiscoveryCandidate[]) {
  return [...candidates].sort((a, b) => b.financialSimilarity - a.financialSimilarity || String(b.lastSeenAt || b.updatedAt || "").localeCompare(String(a.lastSeenAt || a.updatedAt || "")) || a.publicId.localeCompare(b.publicId));
}

export function selectDiscoveryBatch(candidates: DiscoveryCandidate[], limit = 3): DiscoveryCandidate[] {
  return rankCandidates(candidates).slice(0, Math.max(0, Math.min(3, limit)));
}

export function toPublicDiscoveryProfile(candidate: DiscoveryCandidate): DiscoveryProfile | null {
  if (!candidate.characterId || !candidate.personalityCode) return null;
  return {
    publicId: candidate.publicId,
    alias: candidate.alias,
    ageBand: candidate.ageBand,
    region: candidate.region,
    bio: candidate.bio,
    motto: candidate.motto,
    interests: candidate.interests,
    characterId: candidate.characterId,
    personalityCode: candidate.personalityCode,
    financialSimilarity: candidate.financialSimilarity,
  };
}

export function createDiscoveryBatch(candidates: DiscoveryCandidate[], now = new Date()): DiscoveryBatch {
  return {
    batchId: randomUUID(),
    generatedAt: now.toISOString(),
    profiles: selectDiscoveryBatch(candidates).map(toPublicDiscoveryProfile).filter((profile): profile is DiscoveryProfile => Boolean(profile)),
  };
}
