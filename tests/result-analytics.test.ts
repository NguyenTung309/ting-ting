import { describe, expect, it } from "vitest";

import {
  financeAnalyticsCsv,
  filterFinanceAnalyticsRows,
  parseResultAnalyticsFilters,
  summarizeFinanceAnalytics,
  toFinanceAnalyticsRow,
} from "@/lib/tests/result-analytics";

function row(input: Record<string, unknown>) {
  return toFinanceAnalyticsRow({ testSlug: "finance-trend", ...input });
}

describe("finance result analytics", () => {
  it("counts every filtered completion and deduplicates users using their latest result", () => {
    const rows = [
      row({ id: "1", user: "u1", submittedAt: "2026-10-01T10:00:00.000Z", personalityCode: "S", rawScores: { S: 9, P: 3, A: 3, C: 4, I: 3 } }),
      row({ id: "2", user: { id: "u1" }, completedAt: "2026-10-03T10:00:00.000Z", personalityCode: "SP", rawScores: { S: 7, P: 7, A: 3, C: 3, I: 2 } }),
      row({ id: "3", sessionId: "visitor-1", submittedAt: "2026-10-02T10:00:00.000Z", resultKey: "avoidance" }),
      row({ id: "4", testSlug: "couple-compatibility", user: "u2", resultKey: "spark" }),
    ];
    const filtered = filterFinanceAnalyticsRows(rows, {});
    const summary = summarizeFinanceAnalytics(filtered);

    expect(summary.totalTests).toBe(3);
    expect(summary.uniqueUsers).toBe(2);
    expect(summary.pure).toEqual({ count: 2, percentage: 66.7 });
    expect(summary.hybrid).toEqual({ count: 1, percentage: 33.3 });
    expect(summary.profileDistribution).toHaveLength(15);
    expect(summary.profileDistribution[0]).toMatchObject({ code: "A", count: 1, percentage: 50 });
    expect(summary.profileDistribution[1]).toMatchObject({ code: "SP", count: 1, percentage: 50 });
  });

  it("uses a shared session to join an anonymous result to a later signed-in result", () => {
    const rows = [
      row({ id: "1", sessionId: "same-visitor", submittedAt: "2026-10-01T10:00:00.000Z", resultKey: "S" }),
      row({ id: "2", sessionId: "same-visitor", user: "u1", submittedAt: "2026-10-02T10:00:00.000Z", resultKey: "P" }),
    ];
    const summary = summarizeFinanceAnalytics(rows);

    expect(summary.totalTests).toBe(2);
    expect(summary.uniqueUsers).toBe(1);
    expect(summary.profileDistribution[0]).toMatchObject({ code: "P", count: 1 });
  });

  it("filters by inclusive date range, type, and final profile", () => {
    const rows = [
      row({ id: "1", submittedAt: "2026-10-01T00:00:00.000Z", resultKey: "S" }),
      row({ id: "2", submittedAt: "2026-10-02T23:59:59.999Z", resultKey: "SP" }),
      row({ id: "3", submittedAt: "2026-10-03T00:00:00.000Z", resultKey: "SP" }),
    ];
    const filters = parseResultAnalyticsFilters(new URLSearchParams("startDate=2026-10-02&endDate=2026-10-02&resultType=Hybrid&finalProfile=SP"));

    expect(filterFinanceAnalyticsRows(rows, filters).map((item) => item.id)).toEqual(["2"]);
  });

  it("exports the 22 answer columns and escapes spreadsheet formulas", () => {
    const csv = financeAnalyticsCsv([row({
      id: "1", user: "u1", sessionId: "visitor-1", submittedAt: "2026-10-01T10:00:00.000Z", resultKey: "SP",
      rawScores: { S: 7, P: 7, A: 3, C: 3, I: 2 }, scores: { security: 31.8 }, answers: { q1: "=1+1" },
    })]);

    expect(csv).toContain("\uFEFF\"completed_at\"");
    expect(csv).toContain("\"q22\"");
    expect(csv).toContain("\"'=1+1\"");
  });
});
