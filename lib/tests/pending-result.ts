import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { isValidTTTCode, normalizeTTTCode } from "@/lib/tests/submissions";

export const pendingResultCookieName = "ttt_pending_result";
const maxAgeSeconds = 30 * 60;

function secret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === "development" ? "local-development-auth-secret-change-me" : "");
}

function signature(payload: string) {
  const key = secret();
  if (!key) throw new Error("Authentication secret is not configured.");
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function createPendingResultToken(value: string) {
  const code = normalizeTTTCode(value);
  if (!isValidTTTCode(code)) throw new Error("Invalid result code.");
  const expiresAt = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const payload = `${code}.${expiresAt}`;
  return `${payload}.${signature(payload)}`;
}

export function readPendingResultToken(token: string | undefined) {
  if (!token) return null;
  const [code, expiresText, suppliedSignature, extra] = token.split(".");
  if (!code || !expiresText || !suppliedSignature || extra || !isValidTTTCode(code)) return null;
  const expiresAt = Number(expiresText);
  if (!Number.isInteger(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return null;
  const payload = `${code}.${expiresAt}`;
  let expected: string;
  try { expected = signature(payload); } catch { return null; }
  const supplied = Buffer.from(suppliedSignature);
  const actual = Buffer.from(expected);
  return supplied.length === actual.length && timingSafeEqual(supplied, actual) ? code : null;
}
