import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin/auth";

/**
 * Uploads an inline blog image straight to the repo (public/blog-images/)
 * via the GitHub Contents API — same mechanism as saving a post.
 *
 * NOTE: GitHub's Contents API caps base64 uploads at ~1MB per file, so
 * the client compresses/resizes images before sending (see PostForm.tsx).
 */
export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { filename, dataBase64 } = await request.json();
    if (!filename || !dataBase64) {
      return NextResponse.json({ error: "Missing filename or image data." }, { status: 400 });
    }

    const safeName = filename
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const uniqueName = `${Date.now()}-${safeName}`;
    const repoPath = `public/blog-images/${uniqueName}`;

    // dataBase64 arrives as a data URL ("data:image/jpeg;base64,...."); strip the prefix.
    const base64 = dataBase64.includes(",") ? dataBase64.split(",")[1] : dataBase64;
    const approxBytes = (base64.length * 3) / 4;
    if (approxBytes > 1_200_000) {
      return NextResponse.json(
        { error: "Image is still too large after compression (>1.2MB). Try a smaller photo." },
        { status: 413 }
      );
    }

    await putRawFile(repoPath, base64, `Add blog image: ${uniqueName}`);

    return NextResponse.json({ ok: true, path: `/blog-images/${uniqueName}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// --- local helper: identical to putBlogFile but takes pre-encoded base64 ---
async function putRawFile(path: string, base64Content: string, message: string) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !repo) {
    throw new Error("GITHUB_TOKEN and GITHUB_REPO must be set for image uploads to work.");
  }
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, content: base64Content, branch }),
  });
  if (!res.ok) {
    throw new Error(`GitHub image upload failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}
