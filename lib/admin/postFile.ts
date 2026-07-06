import matter from "gray-matter";

export type AdminPost = {
  title: string;
  slug: string;
  date: string;
  excerpt?: string;
  tags: string[];
  draft: boolean;
  content: string;
};

/** Builds the raw .mdx file text (frontmatter + body) from form data. */
export function buildMdxFile(post: Omit<AdminPost, "slug">): string {
  const frontmatter: Record<string, unknown> = {
    title: post.title,
    date: post.date,
    tags: post.tags,
    draft: post.draft,
  };
  if (post.excerpt) frontmatter.excerpt = post.excerpt;

  return matter.stringify(`${post.content.trim()}\n`, frontmatter);
}

/** Parses a raw .mdx file's text back into form-friendly fields. */
export function parseMdxFile(raw: string, slug: string): AdminPost {
  const { data, content } = matter(raw);
  return {
    title: data.title ?? slug,
    slug,
    date: data.date ?? new Date().toISOString().slice(0, 10),
    excerpt: data.excerpt ?? "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    draft: !!data.draft,
    content: content.trim(),
  };
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
