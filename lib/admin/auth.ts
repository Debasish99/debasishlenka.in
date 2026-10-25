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

/**
 * Login rate limiting.
 * Vercel functions are serverless — an in-memory counter would reset on
 * every cold start, so failed-attempt tracking lives in a signed,
 * httpOnly cookie on the browser instead. This survives across
 * serverless invocations without needing a database.
 */
const ATTEMPTS_COOKIE_NAME = "admin_login_attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function readAttempts(): { count: number; firstFailureAt: number } {
  const raw = cookies().get(ATTEMPTS_COOKIE_NAME)?.value;
  if (!raw) return { count: 0, firstFailureAt: 0 };

  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return { count: 0, firstFailureAt: 0 };

  const expected = sign(payload);
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return { count: 0, firstFailureAt: 0 };
    }
  } catch {
    return { count: 0, firstFailureAt: 0 };
  }

  const [countStr, firstStr] = payload.split(":");
  const firstFailureAt = Number(firstStr);
  if (Date.now() - firstFailureAt > LOCKOUT_WINDOW_MS) {
    return { count: 0, firstFailureAt: 0 }; // window expired, treat as reset
  }
  return { count: Number(countStr), firstFailureAt };
}

export function isLockedOut(): boolean {
  return readAttempts().count >= MAX_ATTEMPTS;
}

export function lockoutMinutesRemaining(): number {
  const { firstFailureAt } = readAttempts();
  if (!firstFailureAt) return 0;
  const remainingMs = LOCKOUT_WINDOW_MS - (Date.now() - firstFailureAt);
  return Math.max(1, Math.ceil(remainingMs / 60000));
}

/** Call after a failed login attempt. Returns attempts remaining before lockout. */
export function recordFailedLoginAttempt(): { remaining: number } {
  const current = readAttempts();
  const firstFailureAt = current.count === 0 ? Date.now() : current.firstFailureAt;
  const count = current.count + 1;
  const payload = `${count}:${firstFailureAt}`;

  cookies().set(ATTEMPTS_COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: LOCKOUT_WINDOW_MS / 1000,
  });

  return { remaining: Math.max(0, MAX_ATTEMPTS - count) };
}

/** Call after a successful login. */
export function clearLoginAttempts(): void {
  cookies().delete(ATTEMPTS_COOKIE_NAME);
}
