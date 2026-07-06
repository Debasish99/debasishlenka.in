import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAllTags, getPostsByTag } from "@/lib/blog/posts";

type Props = { params: { tag: string } };

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: Props): Metadata {
  return { title: `#${params.tag}` };
}

export default function BlogTagPage({ params }: Props) {
  const posts = getPostsByTag(params.tag);

  return (
    <Container className="pb-24 pt-20 md:pt-28">
      <SectionHeading eyebrow="Tag" title={`#${params.tag}`} />
      <ul className="mt-12 divide-y divide-border">
        {posts.map((post) => (
          <li key={post.frontmatter.slug} className="py-6">
            <Link
              href={`/blog/${post.frontmatter.slug}`}
              className="font-display text-xl text-text hover:text-accent"
            >
              {post.frontmatter.title}
            </Link>
          </li>
        ))}
        {posts.length === 0 && (
          <li className="py-6 text-text-muted">No posts with this tag.</li>
        )}
      </ul>
    </Container>
  );
}
