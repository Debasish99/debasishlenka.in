import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog/posts";
import { site } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function PostOGImage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  const title = post?.frontmatter.title ?? site.name;
  const tags = post?.frontmatter.tags ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0A0A0A",
          color: "#F5F4F0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 20, color: "#FF6B35", letterSpacing: 4, textTransform: "uppercase" }}>
          {`${site.domain} · Blog`}
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.15, maxWidth: 1000 }}>
          {title}
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 22, color: "#9B9994" }}>
          {tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      </div>
    ),
    size
  );
}
