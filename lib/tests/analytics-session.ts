import { randomUUID } from "node:crypto";

export const resultAnalyticsSessionCookieName = "ttt_result_session";
export const resultAnalyticsSessionMaxAge = 60 * 60 * 24 * 365;

export function getOrCreateResultAnalyticsSessionId(value: string | undefined) {
  return value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value.toLowerCase()
    : randomUUID();
}
