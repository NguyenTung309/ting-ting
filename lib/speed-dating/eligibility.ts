import type { DiscoveryCandidate, ProfileExposureRecord, SpeedDatingProfileRecord } from "./types";

export const PASS_COOLDOWN_DAYS = 30;
export const VIEW_COOLDOWN_DAYS = 7;

function parseDateOnly(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(value)) return null;
  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  if (Number.isNaN(timestamp) || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

export function isValidDateOnly(value: unknown) {
  return Boolean(parseDateOnly(value));
}

export function isAdult(value: unknown, now = new Date()) {
  const birth = parseDateOnly(value);
  if (!birth) return false;
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const month = now.getUTCMonth() - birth.getUTCMonth();
  if (month < 0 || (month === 0 && now.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age >= 18;
}

export function getAgeBand(value: string, now = new Date()) {
  const birth = parseDateOnly(value);
  if (!birth) return null;
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const month = now.getUTCMonth() - birth.getUTCMonth();
  if (month < 0 || (month === 0 && now.getUTCDate() < birth.getUTCDate())) age -= 1;
  if (age < 18) return null;
  if (age < 25) return "18-24" as const;
  if (age < 35) return "25-34" as const;
  if (age < 45) return "35-44" as const;
  return "45-plus" as const;
}

export function isExposureCoolingDown(exposure: ProfileExposureRecord, now = new Date()) {
  if (!exposure.cooldownUntil) return false;
  const until = new Date(exposure.cooldownUntil);
  return !Number.isNaN(until.getTime()) && until.getTime() > now.getTime();
}

export type EligibilityInput = {
  viewerUserId: string;
  candidates: SpeedDatingProfileRecord[];
  blockedUserIds?: ReadonlySet<string>;
  reportedUserIds?: ReadonlySet<string>;
  excludedUserIds?: ReadonlySet<string>;
  exposures?: ReadonlyMap<string, ProfileExposureRecord[]>;
  now?: Date;
};

export function getEligibleCandidates({ viewerUserId, candidates, blockedUserIds = new Set(), reportedUserIds = new Set(), excludedUserIds = new Set(), exposures = new Map(), now = new Date() }: EligibilityInput): SpeedDatingProfileRecord[] {
  return candidates.filter((candidate) => {
    if (candidate.userId === viewerUserId) return false;
    if (candidate.userStatus !== "active" || !candidate.enabled || candidate.status !== "active") return false;
    if (!candidate.dateOfBirth || !isAdult(candidate.dateOfBirth, now)) return false;
    if (!candidate.quizResultId || candidate.quizFormulaVersion !== 3) return false;
    if (blockedUserIds.has(candidate.userId) || reportedUserIds.has(candidate.userId) || excludedUserIds.has(candidate.userId)) return false;
    return !(exposures.get(candidate.userId) || []).some((exposure) => isExposureCoolingDown(exposure, now));
  });
}

export function toDiscoveryCandidate(profile: SpeedDatingProfileRecord, financialSimilarity: number): DiscoveryCandidate {
  return { ...profile, financialSimilarity };
}
