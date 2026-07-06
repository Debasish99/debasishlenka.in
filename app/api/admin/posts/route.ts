import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin/auth";
import { getBlogFile, putBlogFile } from "@/lib/admin/github";
import { buildMdxFile, slugify } from "@/lib/admin/postFile";

export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const slug = slugify(body.slug || body.title);
  if (!slug) {
    return NextResponse.json({ error: "Title or slug is required." }, { status: 400 });
  }
  const path = `content/blog/${slug}.mdx`;

  try {
    const existing = await getBlogFile(path);
    if (existing) {
      return NextResponse.json(
        { error: `A post with slug "${slug}" already exists.` },
        { status: 409 }
      );
    }

    const mdx = buildMdxFile({
      title: body.title,
      date: body.date,
      excerpt: body.excerpt,
      tags: body.tags || [],
      draft: !!body.draft,
      content: body.content || "",
    });

    await putBlogFile(path, mdx, `Add blog post: ${body.title}`);
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
