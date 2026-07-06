type ImgSize = "small" | "medium" | "large" | "full";
type ImgAlign = "left" | "right" | "center";

const WIDTHS: Record<ImgSize, string> = {
  small: "300px",
  medium: "500px",
  large: "750px",
  full: "100%",
};

/**
 * Custom MDX image tag for blog posts — lets a post control image size
 * and alignment instead of always being full page width.
 *
 * Usage inside a .mdx post:
 *   <Img src="/blog-images/x.jpg" alt="caption" size="medium" align="center" />
 *   <Img src="/blog-images/x.jpg" alt="caption" size="small" align="left" />
 *
 * left/right float the image so paragraph text wraps around it;
 * center/full are block-level. Plain markdown ![]() images still work
 * too and render full-width, unchanged.
 */
export function Img({
  src,
  alt = "",
  size = "full",
  align = "center",
}: {
  src: string;
  alt?: string;
  size?: ImgSize;
  align?: ImgAlign;
}) {
  const width = WIDTHS[size] ?? WIDTHS.full;
  const isFull = size === "full";

  const positionClass = isFull
    ? "block mx-auto mb-6"
    : align === "left"
      ? "float-left mr-6 mb-4"
      : align === "right"
        ? "float-right ml-6 mb-4"
        : "block mx-auto mb-6";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`not-prose rounded ${positionClass}`}
      style={{ width, maxWidth: "100%" }}
    />
  );
}
