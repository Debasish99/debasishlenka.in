import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import powershell from "highlight.js/lib/languages/powershell";
import dos from "highlight.js/lib/languages/dos";
import nginx from "highlight.js/lib/languages/nginx";
import dockerfile from "highlight.js/lib/languages/dockerfile";

/**
 * Shared MDX compile options — used by the live blog (RSC renderer) AND the
 * admin preview (serialize), so what you preview is exactly what gets published.
 *  - remark-gfm: tables, task lists, strikethrough, bare-URL autolinks
 *  - rehype-highlight: syntax highlighting for fenced code blocks
 */
export const mdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    [
      rehypeHighlight,
      {
        detect: false,
        ignoreMissing: true,
        // Added on top of the default set — PowerShell isn't included by default.
        languages: { powershell, dos, nginx, dockerfile },
        aliases: { powershell: ["ps1", "pwsh", "ps"], dos: ["bat", "cmd", "batch"] },
      },
    ],
  ],
} as never;

/** Typography classes shared by the live post and the preview. */
export const PROSE_CLASSES =
  "prose prose-invert max-w-none prose-headings:font-display prose-a:text-accent " +
  "prose-img:rounded-md prose-code:before:content-none prose-code:after:content-none " +
  "prose-pre:border prose-pre:border-border prose-pre:bg-bg-raised prose-pre:p-4 " +
  "prose-th:text-text prose-td:text-text-muted prose-blockquote:border-accent";
