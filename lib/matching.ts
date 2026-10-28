import { getAppRecordClient } from "@/lib/app-database";
import { getCurrentUserId } from "@/lib/auth";

export function matchingEnabled() {
  return process.env.MATCHING_ENABLED === "true";
}

export function speedDatingEnabled() {
  return process.env.SPEED_DATING_ENABLED === "true";
}

export function isAdult(value: unknown) {
  if (typeof value !== "string" || !value) return false;
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return false;
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const month = now.getUTCMonth() - birth.getUTCMonth();
  if (month < 0 || (month === 0 && now.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age >= 18;
}

export function ageBandForBirthDate(value: string) {
  const birth = new Date(value);
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  if (now.getUTCMonth() < birth.getUTCMonth() || (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate())) age -= 1;
  if (age < 25) return "18-24";
  if (age < 35) return "25-34";
  if (age < 45) return "35-44";
  return "45-plus";
}

function idOf(value: unknown) {
  if (typeof value === "object" && value && "id" in value) return String((value as { id: unknown }).id);
  return value == null ? "" : String(value);
}

export function similarityFromScores(a: Record<string, unknown>, b: Record<string, unknown>) {
  const keys = ["security", "experience", "avoidance", "control", "independence"];
  const average = keys.reduce((total, key) => total + Math.abs(Number(a[key] ?? 0) - Number(b[key] ?? 0)), 0) / keys.length;
  return Math.max(0, Math.min(100, 100 - Math.round(average)));
}

async function latestV4(cms: NonNullable<Awaited<ReturnType<typeof getAppRecordClient>>>, userId: string) {
  const result = await cms.find({ collection: "test-submissions", where: { and: [{ user: { equals: userId } }, { testSlug: { equals: "finance-trend" } }, { formulaVersion: { equals: 4 } }] }, sort: "-submittedAt", limit: 1, overrideAccess: true });
  const doc = result.docs[0] as unknown as Record<string, unknown> | undefined;
  if (!doc) return null;
  return { doc, scores: (doc.scores && typeof doc.scores === "object" ? doc.scores : {}) as Record<string, unknown> };
}

export async function getMatchingSuggestions() {
  const userId = await getCurrentUserId();
  const cms = await getAppRecordClient();
  if (!userId || !cms) return { userId: null, suggestions: [] };
  const ownResult = await latestV4(cms, userId);
  if (!ownResult) return { userId, suggestions: [], needsV4: true };
  const profiles = await cms.find({ collection: "matching-profiles", where: { and: [{ enabled: { equals: true } }, { status: { equals: "active" } }] }, limit: 100, depth: 0, overrideAccess: true });
  const blocked = await cms.find({ collection: "blocks", where: { or: [{ blocker: { equals: userId } }, { blocked: { equals: userId } }] }, limit: 200, overrideAccess: true });
  const blockedIds = new Set(blocked.docs.flatMap((doc) => [idOf((doc as unknown as Record<string, unknown>).blocker), idOf((doc as unknown as Record<string, unknown>).blocked)]));
  const requests = await cms.find({ collection: "connection-requests", where: { or: [{ sender: { equals: userId } }, { receiver: { equals: userId } }] }, limit: 200, overrideAccess: true });
  const excluded = new Set(requests.docs.filter((doc) => ["pending", "rejected", "blocked", "accepted"].includes(String((doc as unknown as Record<string, unknown>).status))).flatMap((doc) => { const row = doc as unknown as Record<string, unknown>; return [idOf(row.sender), idOf(row.receiver)]; }));
  const reports = await cms.find({ collection: "reports", where: { or: [{ reporter: { equals: userId } }, { targetUser: { equals: userId } }] }, limit: 200, overrideAccess: true });
  for (const doc of reports.docs as unknown as Record<string, unknown>[]) { excluded.add(idOf(doc.reporter)); excluded.add(idOf(doc.targetUser)); }
  const candidates: Array<Record<string, unknown>> = [];
  for (const profileDoc of profiles.docs as unknown as Record<string, unknown>[]) {
    const candidateUserId = idOf(profileDoc.user);
    if (!candidateUserId || candidateUserId === userId || blockedIds.has(candidateUserId) || excluded.has(candidateUserId) || !isAdult(profileDoc.birthDate)) continue;
    const candidateResult = await latestV4(cms, candidateUserId);
    if (!candidateResult) continue;
    candidates.push({ id: String(profileDoc.id), userId: candidateUserId, profile: profileDoc, compatibilityScore: similarityFromScores(ownResult.scores, candidateResult.scores), lastSeenAt: String(profileDoc.updatedAt ?? "") });
  }
  candidates.sort((a, b) => Number(b.compatibilityScore) - Number(a.compatibilityScore) || String(b.lastSeenAt).localeCompare(String(a.lastSeenAt)) || String(a.userId).localeCompare(String(b.userId)));
  return { userId, suggestions: candidates.slice(0, 3), needsV4: false };
}

export function publicMatchingProfile(row: Record<string, unknown>, connected = false) {
  return { id: String(row.id), alias: connected ? String(row.alias ?? "") : "Người cùng tần số", avatar: connected ? row.avatar : null, ageBand: row.ageBand ?? null, region: row.region ?? null, bio: connected ? row.bio ?? null : null, motto: connected ? row.motto ?? null : null, preferences: connected ? row.preferences ?? null : null, connected };
}
