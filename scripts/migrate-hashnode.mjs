/**
 * Hashnode → MDX migration script
 * ------------------------------------------------------------------
 * Usage:
 *   1. Export your posts from Hashnode (Dashboard → Settings → Import/Export
 *      → Export, or via their GraphQL API) as markdown files.
 *   2. Put the exported .md files into content/blog/hashnode-export/
 *   3. Run: npm run migrate-hashnode
 *
 * This reads each file, normalizes whatever frontmatter field names
 * Hashnode used into our schema (title/slug/date/excerpt/tags/coverImage/
 * draft), and writes a clean .mdx file into content/blog/.
 *
 * NOTE: Hashnode's exact export field names can vary by account/plan.
 * If this script's field-mapping guesses don't match your actual
 * export, paste me one example exported file and I'll adjust the
 * mapping precisely rather than guessing further.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const EXPORT_DIR = path.join(ROOT, "content/blog/hashnode-export");
const BLOG_DIR = path.join(ROOT, "content/blog");

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Tries several common field-name variants seen across Hashnode exports. */
function pick(data, ...keys) {
  for (const key of keys) {
    if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
      return data[key];
    }
  }
  return undefined;
}

function normalizeDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function normalizeTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  return String(value)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function main() {
  if (!fs.existsSync(EXPORT_DIR)) {
    console.log(`No export folder found at ${EXPORT_DIR}.`);
    console.log("Create it and drop your Hashnode-exported .md files inside, then re-run.");
    return;
  }
  fs.mkdirSync(BLOG_DIR, { recursive: true });

  const files = fs.readdirSync(EXPORT_DIR).filter((f) => f.endsWith(".md"));
  if (files.length === 0) {
    console.log("No .md files found in content/blog/hashnode-export/.");
    return;
  }

  let migrated = 0;

  for (const file of files) {
    const raw = fs.readFileSync(path.join(EXPORT_DIR, file), "utf-8");
    const { data, content } = matter(raw);

    const title = pick(data, "title", "Title") || path.basename(file, ".md");
    const slug = slugify(pick(data, "slug", "slugPath", "Slug") || title);
    const date = normalizeDate(pick(data, "date", "publishedAt", "dateAdded", "cover_image_date"));
    const excerpt = pick(data, "excerpt", "brief", "subtitle", "seoDescription");
    const tags = normalizeTags(pick(data, "tags", "Tags"));
    const coverImage = pick(data, "coverImage", "cover_image", "cover");

    const frontmatter = {
      title,
      slug,
      date,
      ...(excerpt ? { excerpt } : {}),
      tags,
      ...(coverImage ? { coverImage } : {}),
      draft: false,
    };

    const out = matter.stringify(content, frontmatter);
    fs.writeFileSync(path.join(BLOG_DIR, `${slug}.mdx`), out);
    console.log(`Migrated: ${file} → ${slug}.mdx`);
    migrated += 1;
  }

  console.log(`\nDone — migrated ${migrated} post(s) into content/blog/.`);
  console.log("Spot-check a few for formatting (Hashnode-specific embeds/shortcodes");
  console.log("may need manual cleanup) before considering the migration complete.");
}

main();
