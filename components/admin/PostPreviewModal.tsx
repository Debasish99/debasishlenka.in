"use client";

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { mdxComponents } from "@/components/blog/mdxComponents";
import { PROSE_CLASSES } from "@/lib/blog/mdxOptions";

type Props = {
  title: string;
  date: string;
  tags: string[];
  source: MDXRemoteSerializeResult;
  onClose: () => void;
};

/** The rendered post (header + body) — shared by the modal and the live split pane. */
export function PostPreviewBody({
  title,
  date,
  tags,
  source,
}: Omit<Props, "onClose">) {
  return (
    <>
      <p className="font-mono text-xs text-text-faint">{date || "—"}</p>
      <h1 className="mt-2 font-display text-4xl leading-[1.05] text-text md:text-5xl">
        {title || "Untitled post"}
      </h1>
      <div className="mt-4 flex flex-wrap gap-3">
        {tags.map((tag) => (
          <span key={tag} className="font-mono text-xs text-text-faint">
            #{tag}
          </span>
        ))}
      </div>
      <div className={`${PROSE_CLASSES} mt-10`}>
        <MDXRemote {...source} components={mdxComponents} />
      </div>
    </>
  );
}

export function PostPreviewModal({ onClose, ...rest }: Props) {
  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-background/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="mx-auto max-w-3xl px-6 py-16" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wide text-accent">
            Preview — not published
          </span>
          <button
            onClick={onClose}
            className="font-mono text-xs uppercase tracking-wide text-text-muted transition-colors hover:text-text"
          >
            Close ✕
          </button>
        </div>
        <PostPreviewBody {...rest} />
      </div>
    </div>
  );
}
