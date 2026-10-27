import type { Metadata } from "next";
import { site } from "@/lib/constants";

type Args = {
  title: string;
  description: string;
  /** Path only, e.g. "/photography" — resolved against metadataBase. */
  path: string;
  /** Optional absolute URL; falls back to the site-wide share image. */
  image?: string;
  type?: "website" | "article";
};

/**
 * Per-page SEO: unique title/description, canonical URL, and matching
 * Open Graph / Twitter tags. Without this every page inherits the home
 * page's description, and canonical/og:url point at the home page.
 */
export function pageMeta({ title, description, path, image, type = "website" }: Args): Metadata {
  const url = `https://${site.domain}${path}`;
  // A page-level openGraph replaces the parent's wholesale, so the site-wide
  // share image has to be re-applied explicitly or the page ends up with none.
  image = image ?? `https://${site.domain}/opengraph-image`;
  const full = `${title} — ${site.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: full,
      description,
      url,
      siteName: site.name,
      type,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: full,
      description,
      images: [image],
    },
  };
}

/** Small, share-friendly version of a local photo (Next's built-in optimizer). */
export function shareImage(src: string): string {
  return `https://${site.domain}/_next/image?url=${encodeURIComponent(src)}&w=1200&q=75`;
}
