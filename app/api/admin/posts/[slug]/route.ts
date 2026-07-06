import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin/auth";
import { deleteBlogFile, getBlogFile, putBlogFile } from "@/lib/admin/github";
import { buildMdxFile } from "@/lib/admin/postFile";

type Props = { params: { slug: string } };

export async function GET(_req: Request, { params }: Props) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const file = await getBlogFile(`content/blog/${params.slug}.mdx`);
    if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ content: file.content });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Props) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const path = `content/blog/${params.slug}.mdx`;

  try {
    const existing = await getBlogFile(path);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const mdx = buildMdxFile({
      title: body.title,
      date: body.date,
      excerpt: body.excerpt,
      tags: body.tags || [],
      draft: !!body.draft,
      content: body.content || "",
    });

    await putBlogFile(path, mdx, `Update blog post: ${body.title}`, existing.sha);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Props) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const path = `content/blog/${params.slug}.mdx`;

  try {
    const existing = await getBlogFile(path);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await deleteBlogFile(path, `Delete blog post: ${params.slug}`, existing.sha);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
