import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Minimal single-user session auth for the admin panel.
 * One shared password (ADMIN_PASSWORD) — this site has exactly one
 * admin (you), so there's no user table, just a signed session cookie.
 */

export const SESSION_COOKIE_NAME = "admin_session";
const TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
export const SESSION_TTL_SECONDS = TTL_MS / 1000;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET environment variable is not set — required for admin login."
    );
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSessionCookieValue(): string {
  const expiresAt = Date.now() + TTL_MS;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

export function isValidSessionValue(value: string | undefined | null): boolean {
  if (!value) return false;
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return false;
  if (Number(payload) < Date.now()) return false; // expired

  const expected = sign(payload);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false; // length mismatch etc.
  }
}

/** Call only from Server Components / Route Handlers (Node runtime). */
export function isAuthenticated(): boolean {
  const value = cookies().get(SESSION_COOKIE_NAME)?.value;
  return isValidSessionValue(value);
}
