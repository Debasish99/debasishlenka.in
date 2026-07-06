import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createSessionCookieValue,
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

  const { password } = await request.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  cookies().set(SESSION_COOKIE_NAME, createSessionCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return NextResponse.json({ ok: true });
}
