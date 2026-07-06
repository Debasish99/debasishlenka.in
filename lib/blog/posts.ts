import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { postFrontmatterSchema, type PostFrontmatter } from "./schema";

/**
 * Blog data-access layer. Reads .mdx files from content/blog/, parses
 * frontmatter via gray-matter, and validates it against schema.ts.
 * The admin panel (lib/admin/postFile.ts) and the Hashnode migration
 * script (scripts/migrate-hashnode.mjs) both write files in the same
 * frontmatter shape this file expects — keep them in sync if the
 * schema changes.
 */

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type Post = {
  frontmatter: PostFrontmatter;
  content: string;
  readingTime: string;
};

function readPostFile(fileName: string): Post {
  const filePath = path.join(BLOG_DIR, fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const slugFromFile = fileName.replace(/\.mdx?$/, "");
  const frontmatter = postFrontmatterSchema.parse({
    slug: slugFromFile,
    ...data,
  });

  return {
    frontmatter,
    content,
    readingTime: readingTime(content).text,
  };
}

export function getAllPosts({ includeDrafts = false } = {}): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const posts = files
    .map(readPostFile)
    .filter((p) => includeDrafts || !p.frontmatter.draft)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );

  return posts;
}

export function getPostBySlug(slug: string): Post | null {
  const candidates = [`${slug}.mdx`, `${slug}.md`];
  for (const fileName of candidates) {
    if (fs.existsSync(path.join(BLOG_DIR, fileName))) {
      return readPostFile(fileName);
    }
  }
  return null;
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of getAllPosts()) {
    post.frontmatter.tags.forEach((t) => tags.add(t));
  }
  return Array.from(tags).sort();
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((p) => p.frontmatter.tags.includes(tag));
}
