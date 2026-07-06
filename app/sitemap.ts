import type { MetadataRoute } from "next";
import { site } from "@/lib/constants";
import { getAllPosts, getAllTags } from "@/lib/blog/posts";
import { getFolios } from "@/lib/photography";
import { getExperiments } from "@/lib/lab";

const BASE = `https://${site.domain}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/photography", "/work", "/resume", "/lab", "/blog"].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
  }));

  const posts = getAllPosts().map((post) => ({
    url: `${BASE}/blog/${post.frontmatter.slug}`,
    lastModified: new Date(post.frontmatter.date),
  }));

  const tags = getAllTags().map((tag) => ({
    url: `${BASE}/blog/tag/${tag}`,
    lastModified: new Date(),
  }));

  const folios = getFolios().map((folio) => ({
    url: `${BASE}/photography/${folio.slug}`,
    lastModified: new Date(),
  }));

  const experiments = getExperiments().map((e) => ({
    url: `${BASE}/lab/${e.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...posts, ...tags, ...folios, ...experiments];
}
