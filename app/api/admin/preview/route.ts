import { NextResponse } from "next/server";
import { serialize } from "next-mdx-remote/serialize";
import { isAuthenticated } from "@/lib/admin/auth";
import { mdxOptions } from "@/lib/blog/mdxOptions";

/**
 * Renders draft content through the same MDX pipeline (incl. tables and
 * code highlighting) the live blog uses, so the preview is the real thing.
 */
export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { content } = await request.json();
    const source = await serialize(content || "", { mdxOptions });
    return NextResponse.json({ source });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
