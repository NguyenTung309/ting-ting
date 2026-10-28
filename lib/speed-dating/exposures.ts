import { PASS_COOLDOWN_DAYS, VIEW_COOLDOWN_DAYS } from "./eligibility";
import type { SpeedDatingExposureAction } from "./types";

export function cooldownUntilFor(action: SpeedDatingExposureAction, now = new Date()) {
  const days = action === "passed" ? PASS_COOLDOWN_DAYS : action === "viewed" || action === "opened" ? VIEW_COOLDOWN_DAYS : 0;
  if (days === 0) return null;
  const until = new Date(now);
  until.setUTCDate(until.getUTCDate() + days);
  return until.toISOString();
}

export function exposureKey(viewerId: string, candidateId: string, batchId: string, action: SpeedDatingExposureAction) {
  return `${viewerId}:${candidateId}:${batchId}:${action}`;
}
