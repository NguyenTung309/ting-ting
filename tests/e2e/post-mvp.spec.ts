import { expect, test } from "@playwright/test";

test("health and scoring v4 public contract are stable", async ({ request }) => {
  const health = await request.get("/api/health");
  expect(health.ok()).toBeTruthy();
  expect((await health.json()).app).toBe(true);

  const answers: Record<string, string> = { q0: "MOON" };
  for (let index = 1; index <= 22; index += 1) answers[`q${index}`] = index % 4 === 0 ? "d" : "a";
  const evaluated = await request.post("/api/tests/finance-trend/evaluate", { data: { respondentName: "Contract test", imageChoice: "MOON", answers } });
  expect(evaluated.ok()).toBeTruthy();
  const result = await evaluated.json();
  expect(result.formulaVersion).toBe(4);
  expect(result.testVersion).toBe(4);
  expect(result.top1).toMatch(/^(S|P|A|C|I)$/);
  expect(result.top2).toMatch(/^(S|P|A|C|I)$/);
  expect(result.resultType).toMatch(/^(Pure|Hybrid)$/);
  expect(result.finalProfile).toBe(result.personalityCode);
  expect(result.characterId).toMatch(/^MOON_(S|P|A|C|I|SP|SA|SC|SI|PA|PC|PI|AC|AI|CI)$/);
  expect(Object.values(result.rawScores as Record<string, number>).reduce((sum: number, value: number) => sum + value, 0)).toBe(22);
  expect(Object.values(result.scores as Record<string, number>).reduce((sum: number, value: number) => sum + value, 0)).toBeCloseTo(100);

  const lookup = await request.get(`/api/results/${result.tttCode}`);
  const publicResult = await lookup.json();
  expect(publicResult.answers).toBeUndefined();
  expect(publicResult.rawScores).toBeUndefined();
  expect(publicResult.characterId).toBe(result.characterId);

  const card = await request.get(`/api/results/${result.tttCode}/card`);
  expect(card.ok()).toBeTruthy();
  expect(card.headers()["content-type"]).toContain("image/png");

  const canonicalResultPage = await request.get(`/result/${result.tttCode}`);
  expect(canonicalResultPage.ok()).toBeTruthy();
});

test("paused account and Speed Dating pages return visitors to the homepage", async ({ page }) => {
  for (const route of ["/speed-dating", "/speed-dating/discover", "/matching", "/matching/ho-so", "/tai-khoan", "/tai-khoan/ho-so", "/account"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/$/);
  }
});

test("paused Speed Dating pages stay hidden and API remains safely gated", async ({ page, request }) => {
  await page.goto("/speed-dating");
  await expect(page).toHaveURL(/\/$/);
  const profile = await request.get("/api/speed-dating/profile");
  expect(profile.status()).toBe(503);
  expect((await profile.json()).enabled).toBe(false);
});
