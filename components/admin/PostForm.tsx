"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import type { AdminPost } from "@/lib/admin/postFile";
import { PostPreviewBody, PostPreviewModal } from "@/components/admin/PostPreviewModal";

type Props = {
  mode: "new" | "edit";
  initial?: AdminPost;
  /** Tags already used on the blog — offered as one-click suggestions. */
  existingTags?: string[];
};

type Draft = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string;
  draft: boolean;
  content: string;
};

const inputClass =
  "border border-border bg-bg-raised px-3 py-2 text-sm text-text outline-none focus:border-accent";

const toolBtn =
  "border border-border px-2.5 py-1.5 font-mono text-xs text-text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function youTubeId(input: string): string | null {
  const m = input.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,15})/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{6,15}$/.test(input.trim()) ? input.trim() : null;
}

/** Resizes/compresses an image in-browser before upload, so phone photos
 *  (often 3–10MB) stay under GitHub's ~1MB Contents API limit. */
function compressImage(file: File, maxDimension = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const scale = maxDimension / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PostForm({ mode, initial, existingTags = [] }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [draft, setDraft] = useState(initial?.draft ?? false);
  const [content, setContent] = useState(initial?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageSize, setImageSize] = useState<"small" | "medium" | "large" | "full">("medium");
  const [imageAlign, setImageAlign] = useState<"left" | "right" | "center">("center");
  const [error, setError] = useState<string | null>(null);
  const [previewSource, setPreviewSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Live side-by-side preview
  const [livePreview, setLivePreview] = useState(false);
  const [liveSource, setLiveSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);

  // Autosave / restore
  const [restorable, setRestorable] = useState<(Draft & { savedAt: number }) | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const submittedRef = useRef(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const storageKey = `post-draft:${mode === "edit" ? initial?.slug : "new"}`;

  const tagList = useMemo(
    () => tags.split(",").map((t) => t.trim()).filter(Boolean),
    [tags]
  );

  const current: Draft = { title, slug, date, excerpt, tags, draft, content };
  const currentJson = JSON.stringify(current);
  const initialJson = useRef(
    JSON.stringify({
      title: initial?.title ?? "",
      slug: initial?.slug ?? "",
      date,
      excerpt: initial?.excerpt ?? "",
      tags: (initial?.tags ?? []).join(", "),
      draft: initial?.draft ?? false,
      content: initial?.content ?? "",
    } satisfies Draft)
  ).current;
  const dirty = currentJson !== initialJson;

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readMinutes = Math.max(1, Math.round(words / 200));
  const finalSlug = slugify(slug || title);

  // ---- Autosave to this browser (draft recovery) -------------------------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as Draft & { savedAt: number };
      const { savedAt: _ts, ...fields } = saved;
      void _ts;
      if (JSON.stringify(fields) !== initialJson) setRestorable(saved);
    } catch {
      /* ignore corrupt draft */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (restorable) return; // don't overwrite a recoverable draft before the user decides
    const t = setTimeout(() => {
      try {
        if (dirty) {
          const now = Date.now();
          localStorage.setItem(storageKey, JSON.stringify({ ...current, savedAt: now }));
          setSavedAt(now);
        } else {
          localStorage.removeItem(storageKey);
          setSavedAt(null);
        }
      } catch {
        /* storage full / unavailable — fail silently */
      }
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentJson, restorable]);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty && !submittedRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function restoreDraft() {
    if (!restorable) return;
    setTitle(restorable.title);
    setSlug(restorable.slug);
    setDate(restorable.date);
    setExcerpt(restorable.excerpt);
    setTags(restorable.tags);
    setDraft(restorable.draft);
    setContent(restorable.content);
    setRestorable(null);
  }

  function discardDraft() {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setRestorable(null);
  }

  // ---- Live preview (debounced, same renderer as the live site) ----------
  useEffect(() => {
    if (!livePreview) return;
    if (!content.trim()) {
      setLiveSource(null);
      setLiveError(null);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          setLiveError(data.error || "Couldn't render preview.");
          return;
        }
        setLiveSource(data.source);
        setLiveError(null);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setLiveError("Couldn't render preview.");
      }
    }, 700);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [content, livePreview]);

  // ---- Editor helpers ------------------------------------------------------
  const replaceRange = useCallback(
    (start: number, end: number, text: string, selStart?: number, selEnd?: number) => {
      const el = textareaRef.current;
      setContent((c) => c.slice(0, start) + text + c.slice(end));
      requestAnimationFrame(() => {
        if (!el) return;
        el.focus();
        el.setSelectionRange(
          selStart !== undefined ? start + selStart : start + text.length,
          selEnd !== undefined ? start + selEnd : start + text.length
        );
      });
    },
    []
  );

  function insertAtCursor(text: string) {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? content.length;
    const end = el?.selectionEnd ?? content.length;
    replaceRange(start, end, text);
  }

  /** Wraps the selection (or a placeholder) e.g. **bold**. */
  function wrap(before: string, after: string, placeholder: string) {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? content.length;
    const end = el?.selectionEnd ?? content.length;
    const selected = content.slice(start, end) || placeholder;
    replaceRange(start, end, `${before}${selected}${after}`, before.length, before.length + selected.length);
  }

  /** Prefixes every selected line (or the current one), e.g. "## " or "- ". */
  function prefixLines(prefix: string | ((i: number) => string)) {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? 0;
    const end = el?.selectionEnd ?? 0;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const nl = content.indexOf("\n", end);
    const lineEnd = nl === -1 ? content.length : nl;
    const block = content.slice(lineStart, lineEnd) || "text";
    const out = block
      .split("\n")
      .map((line, i) => (typeof prefix === "function" ? prefix(i) : prefix) + line)
      .join("\n");
    replaceRange(lineStart, lineEnd, out);
  }

  function onCodeBlock() {
    const lang = window.prompt("Language for highlighting (e.g. powershell, bash, yaml, json, python):", "powershell");
    if (lang === null) return;
    const el = textareaRef.current;
    const start = el?.selectionStart ?? content.length;
    const end = el?.selectionEnd ?? content.length;
    const selected = content.slice(start, end) || "your code here";
    const open = `\n\n\`\`\`${lang.trim()}\n`;
    replaceRange(start, end, `${open}${selected}\n\`\`\`\n\n`, open.length, open.length + selected.length);
  }

  function onTable() {
    insertAtCursor(
      "\n\n| Column A | Column B | Column C |\n| --- | --- | --- |\n| One | Two | Three |\n| Four | Five | Six |\n\n"
    );
  }

  function onYouTube() {
    const input = window.prompt("YouTube link (or video ID):", "https://www.youtube.com/watch?v=");
    if (!input) return;
    const id = youTubeId(input);
    if (!id) {
      setError("That doesn't look like a YouTube link.");
      return;
    }
    insertAtCursor(`\n\n<YouTube id="${id}" />\n\n`);
  }

  function onAddLink() {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? content.length;
    const end = el?.selectionEnd ?? content.length;
    const selected = content.slice(start, end);
    const url = window.prompt("Link URL:", "https://");
    if (!url) return;
    const label = selected || "link text";
    replaceRange(start, end, `[${label}](${url})`, 1, 1 + label.length);
  }

  function onTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.metaKey || e.ctrlKey)) return;
    const k = e.key.toLowerCase();
    if (k === "b") {
      e.preventDefault();
      wrap("**", "**", "bold text");
    } else if (k === "i") {
      e.preventDefault();
      wrap("*", "*", "italic text");
    } else if (k === "k") {
      e.preventDefault();
      onAddLink();
    }
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await compressImage(file);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name || "pasted-image.jpg", dataBase64: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Image upload failed.");
        return;
      }
      const alt = (file.name || "image").replace(/\.[^.]+$/, "");
      insertAtCursor(
        `\n\n<Img src="${data.path}" alt="${alt}" size="${imageSize}" align="${imageAlign}" />\n\n`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function onImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void uploadImage(file);
  }

  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
    if (file) {
      e.preventDefault();
      void uploadImage(file);
    }
  }

  function onDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (file) {
      e.preventDefault();
      void uploadImage(file);
    }
  }

  async function onPreview() {
    setPreviewLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't render preview.");
        return;
      }
      setPreviewSource(data.source);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't render preview.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body = { title, slug, date, excerpt, tags: tagList, draft, content };
    const url = mode === "new" ? "/api/admin/posts" : `/api/admin/posts/${initial!.slug}`;
    const method = mode === "new" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong.");
      return;
    }
    submittedRef.current = true;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    router.push("/admin");
    router.refresh();
  }

  async function onDelete() {
    if (!initial) return;
    if (!confirm(`Delete "${initial.title}"? This can't be undone from here.`)) return;
    setDeleting(true);
    setError(null);
    const res = await fetch(`/api/admin/posts/${initial.slug}`, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Delete failed.");
      return;
    }
    submittedRef.current = true;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    router.push("/admin");
    router.refresh();
  }

  const suggestions = existingTags
    .filter((t) => !tagList.includes(t))
    .filter((t) => {
      const last = tags.split(",").pop()?.trim().toLowerCase() ?? "";
      return !last || t.toLowerCase().startsWith(last);
    })
    .slice(0, 12);

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
          e.preventDefault();
          formRef.current?.requestSubmit();
        }
      }}
      className="flex flex-col gap-5"
    >
      {restorable && (
        <div className="flex flex-wrap items-center gap-4 border border-accent px-4 py-3 font-mono text-xs text-text-muted">
          <span>
            Unsaved draft found from {new Date(restorable.savedAt).toLocaleString()}.
          </span>
          <button type="button" onClick={restoreDraft} className="text-accent hover:underline">
            Restore it
          </button>
          <button type="button" onClick={discardDraft} className="hover:text-text">
            Discard
          </button>
        </div>
      )}

      <div className="flex max-w-2xl flex-col gap-5">
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            required
          />
        </Field>

        <Field label="Slug (URL)">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={mode === "edit"}
            placeholder="leave blank to auto-generate from title"
            className={`${inputClass} disabled:opacity-50`}
          />
          <span className="font-mono text-[11px] text-text-faint">
            debasishlenka.in/blog/{finalSlug || "…"}
          </span>
        </Field>

        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Excerpt (shown in listings and search results)">
          <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={inputClass} />
          <span
            className={`font-mono text-[11px] ${
              excerpt.length > 160 ? "text-accent" : "text-text-faint"
            }`}
          >
            {excerpt.length}/160 — search engines usually cut off around 160 characters
          </span>
        </Field>

        <Field label="Tags (comma separated)">
          <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
          {suggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-text-faint">Existing:</span>
              {suggestions.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTags([...tagList, t].join(", "))}
                  className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-text-muted hover:border-accent hover:text-accent"
                >
                  + {t}
                </button>
              ))}
            </div>
          )}
        </Field>

        <label className="flex items-center gap-2 font-mono text-sm text-text-muted">
          <input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} />
          Save as draft (won&apos;t show on the live blog)
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wide text-text-faint">
          Content (Markdown / MDX)
        </span>

        {/* Formatting toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={toolBtn} title="Bold (Ctrl/Cmd+B)" onClick={() => wrap("**", "**", "bold text")}>
            <b>B</b>
          </button>
          <button type="button" className={toolBtn} title="Italic (Ctrl/Cmd+I)" onClick={() => wrap("*", "*", "italic text")}>
            <i>I</i>
          </button>
          <button type="button" className={toolBtn} title="Heading" onClick={() => prefixLines("## ")}>
            H2
          </button>
          <button type="button" className={toolBtn} title="Subheading" onClick={() => prefixLines("### ")}>
            H3
          </button>
          <button type="button" className={toolBtn} title="Quote" onClick={() => prefixLines("> ")}>
            “ ”
          </button>
          <button type="button" className={toolBtn} title="Bulleted list" onClick={() => prefixLines("- ")}>
            • List
          </button>
          <button type="button" className={toolBtn} title="Numbered list" onClick={() => prefixLines((i) => `${i + 1}. `)}>
            1. List
          </button>
          <button type="button" className={toolBtn} title="Task list" onClick={() => prefixLines("- [ ] ")}>
            ☑ Tasks
          </button>
          <button type="button" className={toolBtn} title="Inline code" onClick={() => wrap("`", "`", "code")}>
            {"</>"}
          </button>
          <button type="button" className={toolBtn} title="Code block with syntax highlighting" onClick={onCodeBlock}>
            Code block
          </button>
          <button type="button" className={toolBtn} title="Table" onClick={onTable}>
            Table
          </button>
          <button type="button" className={toolBtn} title="Divider" onClick={() => insertAtCursor("\n\n---\n\n")}>
            ―
          </button>
          <button type="button" className={toolBtn} title="Link (Ctrl/Cmd+K)" onClick={onAddLink}>
            Link
          </button>
          <button type="button" className={toolBtn} title="YouTube embed" onClick={onYouTube}>
            YouTube
          </button>
        </div>

        {/* Image controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={toolBtn}
          >
            {uploading ? "Uploading…" : "+ Insert image"}
          </button>
          <select
            value={imageSize}
            onChange={(e) => setImageSize(e.target.value as typeof imageSize)}
            className="border border-border bg-bg-raised px-2 py-1.5 font-mono text-xs text-text-muted"
          >
            <option value="small">Small (300px)</option>
            <option value="medium">Medium (500px)</option>
            <option value="large">Large (750px)</option>
            <option value="full">Full width</option>
          </select>
          <select
            value={imageAlign}
            onChange={(e) => setImageAlign(e.target.value as typeof imageAlign)}
            disabled={imageSize === "full"}
            className="border border-border bg-bg-raised px-2 py-1.5 font-mono text-xs text-text-muted disabled:opacity-40"
          >
            <option value="center">Center</option>
            <option value="left">Left (text wraps right)</option>
            <option value="right">Right (text wraps left)</option>
          </select>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageSelected}
            className="hidden"
          />
          <label className="ml-auto hidden items-center gap-2 font-mono text-xs text-text-muted lg:flex">
            <input
              type="checkbox"
              checked={livePreview}
              onChange={(e) => setLivePreview(e.target.checked)}
            />
            Live preview (side by side)
          </label>
        </div>

        <p className="font-mono text-[11px] text-text-faint">
          Tip: paste or drag an image straight into the box to upload it. Shortcuts: Ctrl/Cmd+B bold,
          +I italic, +K link, +S save. In plain text, wrap anything with &#123; &#125; or &lt; &gt; in
          backticks (`like this`) — otherwise the MDX renderer treats it as code.
        </p>

        <div className={livePreview ? "grid gap-6 lg:grid-cols-2" : ""}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={onTextareaKeyDown}
            onPaste={onPaste}
            onDrop={onDrop}
            rows={livePreview ? 32 : 22}
            className={`${inputClass} w-full font-mono leading-relaxed`}
          />
          {livePreview && (
            <div className="max-h-[calc(32*1.65rem)] overflow-y-auto border border-border p-5">
              {liveError ? (
                <p className="font-mono text-xs text-accent">
                  Can&apos;t render yet: {liveError}
                </p>
              ) : liveSource ? (
                <PostPreviewBody title={title} date={date} tags={tagList} source={liveSource} />
              ) : (
                <p className="font-mono text-xs text-text-faint">Start typing to see a live preview.</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-between gap-2 font-mono text-[11px] text-text-faint">
          <span>
            {words} words · ~{readMinutes} min read
          </span>
          <span>
            {savedAt
              ? `Draft auto-saved in this browser at ${new Date(savedAt).toLocaleTimeString()}`
              : dirty
                ? "Unsaved changes"
                : "No changes"}
          </span>
        </div>
      </div>

      {error && <p className="font-mono text-sm text-accent">{error}</p>}

      <div className="flex flex-wrap items-center gap-6">
        <button
          type="button"
          onClick={onPreview}
          disabled={previewLoading || !content.trim()}
          className="border border-border px-4 py-2 font-mono text-sm text-text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {previewLoading ? "Rendering…" : "Full preview"}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-accent px-4 py-2 font-mono text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : mode === "new" ? "Publish" : "Save changes"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="font-mono text-sm text-text-faint transition-colors hover:text-accent disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete post"}
          </button>
        )}
      </div>

      {previewSource && (
        <PostPreviewModal
          title={title}
          date={date}
          tags={tagList}
          source={previewSource}
          onClose={() => setPreviewSource(null)}
        />
      )}

      <p className="font-mono text-xs text-text-faint">
        Saving commits directly to GitHub — the live site updates automatically in
        about 30–60 seconds once Vercel finishes redeploying.
      </p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-xs uppercase tracking-wide text-text-faint">{label}</span>
      {children}
    </label>
  );
}
