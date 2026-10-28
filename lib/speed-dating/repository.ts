import { getAppRecordClient } from "@/lib/app-database";
import { calculateFinancialSimilarity } from "./compatibility";
import { getEligibleCandidates } from "./eligibility";
import { cooldownUntilFor, exposureKey } from "./exposures";
import { interestsFromCmsRecord } from "./profiles";
import type { DiscoveryCandidate, ProfileExposureRecord, SpeedDatingExposureAction, SpeedDatingProfileRecord } from "./types";

type AppRecordClient = NonNullable<Awaited<ReturnType<typeof getAppRecordClient>>>;

function idOf(value: unknown) {
  if (typeof value === "object" && value && "id" in value) return String((value as { id: unknown }).id);
  return value == null ? "" : String(value);
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function scoreMap(value: unknown) {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(Object.entries(value).flatMap(([key, score]) => typeof score === "number" && Number.isFinite(score) ? [[key, score]] : []));
}

function profileRecord(row: Record<string, unknown>): SpeedDatingProfileRecord {
  const user = row.user && typeof row.user === "object" ? row.user as Record<string, unknown> : {};
  const result = row.quizResult && typeof row.quizResult === "object" ? row.quizResult as Record<string, unknown> : {};
  const snapshot = result.resultSnapshot && typeof result.resultSnapshot === "object" ? result.resultSnapshot as Record<string, unknown> : {};
  return {
    id: String(row.id),
    publicId: stringOrNull(row.publicId) || "",
    userId: idOf(row.user),
    userStatus: user.status === "suspended" ? "suspended" : user.status === "deleted" ? "deleted" : "active",
    dateOfBirth: stringOrNull(user.dateOfBirth || row.birthDate),
    alias: String(row.alias || "Người cùng tần số"),
    ageBand: row.ageBand === "18-24" || row.ageBand === "25-34" || row.ageBand === "35-44" || row.ageBand === "45-plus" ? row.ageBand : null,
    region: stringOrNull(row.region),
    bio: stringOrNull(row.bio),
    motto: stringOrNull(row.motto),
    interests: interestsFromCmsRecord(row.interests),
    preferences: row.preferences && typeof row.preferences === "object" ? row.preferences as SpeedDatingProfileRecord["preferences"] : {},
    enabled: row.enabled === true,
    status: row.status === "active" || row.status === "paused" || row.status === "suspended" ? row.status : "draft",
    personalityCode: stringOrNull(row.personalityCode || snapshot.personalityCode),
    characterId: stringOrNull(row.characterId || snapshot.characterId),
    quizResultId: idOf(row.quizResult) || null,
    quizFormulaVersion: typeof result.formulaVersion === "number" ? result.formulaVersion : typeof row.formulaVersion === "number" ? row.formulaVersion : null,
    scores: scoreMap(result.scores || snapshot.scores || row.scores),
    lastSeenAt: stringOrNull(user.lastSeenAt),
    updatedAt: stringOrNull(row.updatedAt),
  };
}

export async function findOwnProfile(cms: AppRecordClient, userId: string) {
  const result = await cms.find({ collection: "matching-profiles", where: { user: { equals: userId } }, limit: 1, depth: 1, overrideAccess: true });
  return result.docs[0] ? profileRecord(result.docs[0] as unknown as Record<string, unknown>) : null;
}

export async function findLatestV4Result(cms: AppRecordClient, userId: string) {
  const result = await cms.find({ collection: "test-submissions", where: { and: [{ user: { equals: userId } }, { formulaVersion: { equals: 4 } }, { testSlug: { equals: "finance-trend" } }] }, sort: "-submittedAt", limit: 1, depth: 0, overrideAccess: true });
  const row = result.docs[0] as unknown as Record<string, unknown> | undefined;
  if (!row) return null;
  const snapshot = row.resultSnapshot && typeof row.resultSnapshot === "object" ? row.resultSnapshot as Record<string, unknown> : {};
  return { id: String(row.id), formulaVersion: Number(row.formulaVersion || snapshot.formulaVersion || 0), personalityCode: stringOrNull(row.personalityCode || snapshot.personalityCode) || undefined, characterId: stringOrNull(row.characterId || snapshot.characterId) || undefined, scores: scoreMap(row.scores || snapshot.scores) };
}

async function userIdSet(cms: AppRecordClient, collection: "blocks" | "reports", userId: string) {
  const result = collection === "blocks"
    ? await cms.find({ collection, where: { or: [{ blocker: { equals: userId } }, { blocked: { equals: userId } }] }, limit: 500, overrideAccess: true })
    : await cms.find({ collection, where: { or: [{ reporter: { equals: userId } }, { targetUser: { equals: userId } }] }, limit: 500, overrideAccess: true });
  return new Set((result.docs as unknown as Record<string, unknown>[]).flatMap((row) => collection === "blocks" ? [idOf(row.blocker), idOf(row.blocked)] : [idOf(row.reporter), idOf(row.targetUser)]).filter(Boolean));
}

async function excludedFromRequests(cms: AppRecordClient, userId: string) {
  const result = await cms.find({ collection: "connection-requests", where: { or: [{ sender: { equals: userId } }, { receiver: { equals: userId } }] }, limit: 500, overrideAccess: true });
  return new Set((result.docs as unknown as Record<string, unknown>[]).filter((row) => ["pending", "accepted", "blocked"].includes(String(row.status))).flatMap((row) => [idOf(row.sender), idOf(row.receiver)]).filter(Boolean));
}

async function recentExposures(cms: AppRecordClient, viewerId: string) {
  const result = await cms.find({ collection: "profile-exposures", where: { viewer: { equals: viewerId } }, sort: "-shownAt", limit: 500, overrideAccess: true });
  const map = new Map<string, ProfileExposureRecord[]>();
  for (const raw of result.docs as unknown as Record<string, unknown>[]) {
    const candidateId = idOf(raw.candidate);
    const exposure: ProfileExposureRecord = { viewerId, candidateId, action: String(raw.action) as SpeedDatingExposureAction, shownAt: String(raw.shownAt), cooldownUntil: typeof raw.cooldownUntil === "string" ? raw.cooldownUntil : null };
    map.set(candidateId, [...(map.get(candidateId) || []), exposure]);
  }
  return map;
}

export async function findPublicProfile(cms: AppRecordClient, publicId: string) {
  const result = await cms.find({ collection: "matching-profiles", where: { publicId: { equals: publicId } }, limit: 1, depth: 1, overrideAccess: true });
  const row = result.docs[0] as unknown as Record<string, unknown> | undefined;
  return row ? profileRecord(row) : null;
}

export async function isPairExcluded(cms: AppRecordClient, viewerId: string, candidateId: string) {
  const [blocked, reported, requests] = await Promise.all([
    cms.find({ collection: "blocks", where: { or: [{ and: [{ blocker: { equals: viewerId } }, { blocked: { equals: candidateId } }] }, { and: [{ blocker: { equals: candidateId } }, { blocked: { equals: viewerId } }] }] }, limit: 1, overrideAccess: true }),
    cms.find({ collection: "reports", where: { or: [{ and: [{ reporter: { equals: viewerId } }, { targetUser: { equals: candidateId } }] }, { and: [{ reporter: { equals: candidateId } }, { targetUser: { equals: viewerId } }] }] }, limit: 1, overrideAccess: true }),
    cms.find({ collection: "connection-requests", where: { or: [{ and: [{ sender: { equals: viewerId } }, { receiver: { equals: candidateId } }] }, { and: [{ sender: { equals: candidateId } }, { receiver: { equals: viewerId } }] }] }, limit: 1, overrideAccess: true }),
  ]);
  if (blocked.docs[0] || reported.docs[0]) return true;
  return requests.docs.some((row) => ["pending", "accepted", "blocked"].includes(String((row as unknown as Record<string, unknown>).status)));
}

export async function findDiscoveryCandidates(cms: AppRecordClient, viewerId: string, now = new Date()): Promise<DiscoveryCandidate[]> {
  const own = await findOwnProfile(cms, viewerId);
  if (!own) return [];
  const ownResult = await findLatestV4Result(cms, viewerId);
  if (!ownResult || ownResult.formulaVersion !== 4) return [];
  const profiles = await cms.find({ collection: "matching-profiles", where: { and: [{ enabled: { equals: true } }, { status: { equals: "active" } }] }, limit: 250, depth: 1, overrideAccess: true });
  const [blocked, reported, excluded, exposures] = await Promise.all([userIdSet(cms, "blocks", viewerId), userIdSet(cms, "reports", viewerId), excludedFromRequests(cms, viewerId), recentExposures(cms, viewerId)]);
  const eligible = getEligibleCandidates({ viewerUserId: viewerId, candidates: profiles.docs.map((row) => profileRecord(row as unknown as Record<string, unknown>)), blockedUserIds: blocked, reportedUserIds: reported, excludedUserIds: excluded, exposures, now });
  return eligible.filter((candidate) => Boolean(candidate.publicId) && candidate.quizFormulaVersion === 4).map((candidate) => ({ ...candidate, financialSimilarity: calculateFinancialSimilarity(ownResult.scores, candidate.scores) }));
}

export async function recordExposure(cms: AppRecordClient, viewerId: string, candidateId: string, batchId: string, action: SpeedDatingExposureAction, now = new Date()) {
  const shownAt = now.toISOString();
  const key = exposureKey(viewerId, candidateId, batchId, action);
  const existing = await cms.find({ collection: "profile-exposures", where: { exposureKey: { equals: key } }, limit: 1, overrideAccess: true });
  if (existing.docs[0]) return existing.docs[0];
  return cms.create({ collection: "profile-exposures", data: { viewer: Number(viewerId), candidate: Number(candidateId), batchId, action, shownAt, cooldownUntil: cooldownUntilFor(action, now) || undefined, exposureKey: key }, overrideAccess: true });
}

export async function recordBatchExposures(cms: AppRecordClient, viewerId: string, candidates: SpeedDatingProfileRecord[], batchId: string, now = new Date()) {
  return Promise.all(candidates.map((candidate) => recordExposure(cms, viewerId, candidate.userId, batchId, "viewed", now)));
}

export { idOf, profileRecord };
