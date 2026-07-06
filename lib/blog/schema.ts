import { z } from "zod";

/**
 * Blog post frontmatter shape — used to validate every .mdx file's
 * frontmatter (lib/blog/posts.ts) and shared by the admin panel
 * (lib/admin/postFile.ts) and the Hashnode migration script.
 */
export const postFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  date: z.string(), // ISO date string
  excerpt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().optional(),
  draft: z.boolean().default(false),
});

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;
