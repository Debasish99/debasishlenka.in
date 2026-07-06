import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Container } from "@/components/ui/Container";
import { Img } from "@/components/blog/Img";
import { getAllPosts, getPostBySlug } from "@/lib/blog/posts";
import { site } from "@/lib/constants";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.frontmatter.slug }));
}

// Only slugs returned by generateStaticParams (i.e. non-draft posts) are
// servable. Any other slug — including a real but draft post — 404s
// instead of being rendered on demand. This is what keeps drafts private.
export const dynamicParams = false;

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};

  const url = `https://${site.domain}/blog/${post.frontmatter.slug}`;

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
      url,
      type: "article",
      publishedTime: post.frontmatter.date,
      tags: post.frontmatter.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post || post.frontmatter.draft) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    datePublished: post.frontmatter.date,
    author: { "@type": "Person", name: site.name },
    url: `https://${site.domain}/blog/${post.frontmatter.slug}`,
  };

  return (
    <Container className="max-w-3xl pb-24 pt-20 md:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/blog"
        className="mb-8 inline-block font-mono text-xs uppercase tracking-wide text-text-muted transition-colors hover:text-text"
      >
        ← All posts
      </Link>
      <p className="font-mono text-xs text-text-faint">
        {post.frontmatter.date} · {post.readingTime}
      </p>
      <h1 className="mt-2 font-display text-4xl leading-[1.05] text-text md:text-5xl">
        {post.frontmatter.title}
      </h1>
      <div className="mt-4 flex gap-3">
        {post.frontmatter.tags.map((tag) => (
          <Link
            key={tag}
            href={`/blog/tag/${tag}`}
            className="font-mono text-xs text-text-faint hover:text-accent"
          >
            #{tag}
          </Link>
        ))}
      </div>
      <div className="prose prose-invert mt-10 max-w-none prose-headings:font-display prose-a:text-accent prose-img:rounded-md">
        <MDXRemote
          source={post.content}
          components={{
            img: (props) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img {...props} alt={props.alt ?? ""} loading="lazy" className="w-full rounded" />
            ),
            Img,
          }}
        />
      </div>
    </Container>
  );
}
