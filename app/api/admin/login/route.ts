import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  clearLoginAttempts,
  createSessionCookieValue,
  isLockedOut,
  lockoutMinutesRemaining,
  recordFailedLoginAttempt,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from "@/lib/admin/auth";

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured on the server yet." },
      { status: 500 }
    );
  }

  if (isLockedOut()) {
    const minutes = lockoutMinutesRemaining();
    return NextResponse.json(
      { error: `Too many failed attempts. Try again in ${minutes} minute(s).` },
      { status: 429 }
    );
  }

  const { password } = await request.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    const { remaining } = recordFailedLoginAttempt();
    const error =
      remaining > 0
        ? `Incorrect password. ${remaining} attempt(s) remaining before a temporary lockout.`
        : "Too many failed attempts. Try again in 15 minutes.";
    return NextResponse.json({ error }, { status: 401 });
  }

  clearLoginAttempts();
  cookies().set(SESSION_COOKIE_NAME, createSessionCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return NextResponse.json({ ok: true });
}
