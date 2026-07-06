import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAllPosts } from "@/lib/blog/posts";

export const metadata: Metadata = { title: "Blog" };

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <Container className="pb-24 pt-20 md:pt-28">
      <SectionHeading
        eyebrow="Writing"
        title="Blog"
        description="Notes on infrastructure, photography, and building this site."
      />
      <ul className="mt-16 divide-y divide-border">
        {posts.map((post) => (
          <li key={post.frontmatter.slug} className="py-8">
            <Link href={`/blog/${post.frontmatter.slug}`} className="group block">
              <p className="font-mono text-xs text-text-faint">
                {post.frontmatter.date} · {post.readingTime}
              </p>
              <h3 className="mt-2 font-display text-2xl text-text transition-colors group-hover:text-accent">
                {post.frontmatter.title}
              </h3>
              {post.frontmatter.excerpt && (
                <p className="mt-2 max-w-2xl text-text-muted">{post.frontmatter.excerpt}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {post.frontmatter.tags.map((tag) => (
                  <span key={tag} className="font-mono text-[11px] text-text-faint">
                    #{tag}
                  </span>
                ))}
              </div>
            </Link>
          </li>
        ))}
        {posts.length === 0 && (
          <li className="py-8 text-text-muted">No posts yet — add MDX files to content/blog.</li>
        )}
      </ul>
    </Container>
  );
}
