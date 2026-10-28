import { describe, expect, it } from "vitest";

import { calculateFinancialSimilarity } from "@/lib/speed-dating/compatibility";
import { getEligibleCandidates, getAgeBand, isAdult } from "@/lib/speed-dating/eligibility";
import { rankCandidates, selectDiscoveryBatch, toPublicDiscoveryProfile } from "@/lib/speed-dating/discovery";
import { cooldownUntilFor } from "@/lib/speed-dating/exposures";
import type { DiscoveryCandidate, ProfileExposureRecord, SpeedDatingProfileRecord } from "@/lib/speed-dating/types";

const now = new Date("2026-09-24T00:00:00.000Z");

function profile(overrides: Partial<SpeedDatingProfileRecord> = {}): SpeedDatingProfileRecord {
  return {
    id: "1", publicId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", userId: "1", userStatus: "active", dateOfBirth: "1995-01-01", alias: "Bạn cùng tần số", ageBand: "25-34", region: "Hà Nội", bio: null, motto: null, interests: [], preferences: {}, enabled: true, status: "active", personalityCode: "SP", characterId: "SUN_SP", quizResultId: "10", quizFormulaVersion: 3, scores: { security: 40, experience: 30, avoidance: 10, control: 10, independence: 10 }, lastSeenAt: "2026-09-23T00:00:00.000Z", updatedAt: "2026-09-23T00:00:00.000Z", ...overrides,
  };
}

function candidate(overrides: Partial<DiscoveryCandidate> = {}): DiscoveryCandidate {
  return { ...profile(), financialSimilarity: 80, ...overrides };
}

describe("speed dating domain", () => {
  it("checks the exact adult boundary and rejects invalid dates", () => {
    expect(isAdult("2008-09-24", now)).toBe(true);
    expect(isAdult("2008-09-25", now)).toBe(false);
    expect(isAdult("2008-02-30", now)).toBe(false);
    expect(getAgeBand("2008-09-24", now)).toBe("18-24");
  });

  it("calculates symmetric similarity and returns 100 for the same radar", () => {
    const a = { security: 85, experience: 40, avoidance: 20, control: 60, independence: 10 };
    const b = { security: 75, experience: 50, avoidance: 30, control: 50, independence: 20 };
    expect(calculateFinancialSimilarity(a, a)).toBe(100);
    expect(calculateFinancialSimilarity(a, b)).toBe(calculateFinancialSimilarity(b, a));
  });

  it("filters unsafe and unavailable candidates", () => {
    const cooling: ProfileExposureRecord = { viewerId: "viewer", candidateId: "3", action: "passed", shownAt: now.toISOString(), cooldownUntil: cooldownUntilFor("passed", now) };
    const candidates = [
      profile({ userId: "viewer" }),
      profile({ id: "2", userId: "2" }),
      profile({ id: "3", userId: "3" }),
      profile({ id: "4", userId: "4", userStatus: "suspended" }),
      profile({ id: "5", userId: "5", enabled: false }),
      profile({ id: "6", userId: "6", quizFormulaVersion: 2 }),
    ];
    const result = getEligibleCandidates({ viewerUserId: "viewer", candidates, blockedUserIds: new Set(["2"]), exposures: new Map([["3", [cooling]]]), now });
    expect(result).toHaveLength(0);
  });

  it("ranks deterministically and caps discovery at three", () => {
    const candidates = [
      candidate({ userId: "b", publicId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", financialSimilarity: 90 }),
      candidate({ userId: "c", publicId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", financialSimilarity: 90, lastSeenAt: "2026-09-24T00:00:00.000Z" }),
      candidate({ userId: "a", publicId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", financialSimilarity: 70 }),
      candidate({ userId: "d", publicId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd", financialSimilarity: 60 }),
    ];
    expect(rankCandidates(candidates).map((item) => item.userId)).toEqual(["c", "b", "a", "d"]);
    expect(selectDiscoveryBatch(candidates, 99)).toHaveLength(3);
  });

  it("maps only safe public discovery fields", () => {
    const result = toPublicDiscoveryProfile(candidate());
    expect(result).toEqual(expect.objectContaining({ publicId: expect.any(String), characterId: "SUN_SP", personalityCode: "SP" }));
    expect(result).not.toHaveProperty("dateOfBirth");
    expect(result).not.toHaveProperty("userId");
    expect(result).not.toHaveProperty("quizResultId");
    expect(result).not.toHaveProperty("email");
  });
});
