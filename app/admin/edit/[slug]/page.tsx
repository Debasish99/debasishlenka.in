import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/admin/auth";
import { getBlogFile } from "@/lib/admin/github";
import { parseMdxFile } from "@/lib/admin/postFile";
import { PostForm } from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: { slug: string } }) {
  if (!isAuthenticated()) redirect("/admin/login");

  const file = await getBlogFile(`content/blog/${params.slug}.mdx`);
  if (!file) notFound();
  const post = parseMdxFile(file.content, params.slug);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-2xl text-text">Edit post</h1>
      <div className="mt-8">
        <PostForm mode="edit" initial={post} />
      </div>
    </div>
  );
}
