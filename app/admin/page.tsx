import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/admin/auth";
import { getBlogFile, listBlogFiles } from "@/lib/admin/github";
import { parseMdxFile, type AdminPost } from "@/lib/admin/postFile";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!isAuthenticated()) redirect("/admin/login");

  let posts: AdminPost[] = [];
  let configError: string | null = null;

  try {
    const files = await listBlogFiles();
    posts = await Promise.all(
      files.map(async (f) => {
        const file = await getBlogFile(f.path);
        const slug = f.name.replace(/\.mdx$/, "");
        return parseMdxFile(file!.content, slug);
      })
    );
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    configError = err instanceof Error ? err.message : String(err);
  }

  if (configError) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-display text-2xl text-text">Admin setup incomplete</h1>
        <p className="mt-4 text-text-muted">{configError}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-text">Blog admin</h1>
        <LogoutButton />
      </div>

      <Link
        href="/admin/new"
        className="mt-6 inline-block bg-accent px-4 py-2 font-mono text-sm text-background transition-opacity hover:opacity-90"
      >
        + New post
      </Link>

      <ul className="mt-10 divide-y divide-border">
        {posts.map((post) => (
          <li key={post.slug} className="flex items-center justify-between py-4">
            <div>
              <p className="font-display text-lg text-text">
                {post.title}
                {post.draft && (
                  <span className="ml-2 font-mono text-xs text-text-faint">DRAFT</span>
                )}
              </p>
              <p className="font-mono text-xs text-text-faint">{post.date}</p>
            </div>
            <Link
              href={`/admin/edit/${post.slug}`}
              className="font-mono text-sm text-text-muted transition-colors hover:text-accent"
            >
              Edit
            </Link>
          </li>
        ))}
        {posts.length === 0 && <li className="py-4 text-text-muted">No posts yet.</li>}
      </ul>
    </div>
  );
}
