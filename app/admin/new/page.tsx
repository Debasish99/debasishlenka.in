import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/admin/auth";
import { PostForm } from "@/components/admin/PostForm";
import { getAllTags } from "@/lib/blog/posts";

export default function NewPostPage() {
  if (!isAuthenticated()) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-2xl text-text">New post</h1>
      <div className="mt-8">
        <PostForm mode="new" existingTags={getAllTags()} />
      </div>
    </div>
  );
}
