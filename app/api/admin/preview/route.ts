import { NextResponse } from "next/server";
import { serialize } from "next-mdx-remote/serialize";
import { isAuthenticated } from "@/lib/admin/auth";

/**
 * Renders draft post content through the exact same MDX pipeline the
 * live blog uses, so the preview isn't an approximation — it's the
 * real thing, just not saved anywhere yet.
 */
export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { content } = await request.json();
    const source = await serialize(content || "");
    return NextResponse.json({ source });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
