import { Img } from "@/components/blog/Img";
import { YouTube } from "@/components/blog/YouTube";

/** Components available inside every blog post (live + preview). */
export const mdxComponents = {
  Img,
  YouTube,
  // Wide tables scroll sideways on phones instead of breaking the layout.
  table: (props: React.ComponentProps<"table">) => (
    <div className="not-prose my-6 overflow-x-auto">
      <table
        className="w-full border-collapse text-left text-sm [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-text-muted [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-text"
        {...props}
      />
    </div>
  ),
  // Plain markdown images stay full width, unchanged.
  img: (props: React.ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ""} loading="lazy" className="w-full rounded" />
  ),
};
