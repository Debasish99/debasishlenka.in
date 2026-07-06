"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import type { AdminPost } from "@/lib/admin/postFile";
import { PostPreviewModal } from "@/components/admin/PostPreviewModal";

type Props = {
  mode: "new" | "edit";
  initial?: AdminPost;
};

const inputClass =
  "border border-border bg-bg-raised px-3 py-2 text-sm text-text outline-none focus:border-accent";

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

export function PostForm({ mode, initial }: Props) {
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
  const [imageAlign, setImageAlign] = useState<"left" | "center" | "right">("center");
  const [error, setError] = useState<string | null>(null);
  const [previewSource, setPreviewSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function insertAtCursor(text: string, selectInserted?: { start: number; end: number }) {
    const el = textareaRef.current;
    if (!el) {
      setContent((c) => c + text);
      return;
    }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = content.slice(0, start) + text + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      if (selectInserted) {
        el.setSelectionRange(start + selectInserted.start, start + selectInserted.end);
      } else {
        const pos = start + text.length;
        el.setSelectionRange(pos, pos);
      }
    });
  }

  function onAddLink() {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? content.length;
    const end = el?.selectionEnd ?? content.length;
    const selected = content.slice(start, end);

    const url = window.prompt("Link URL:", "https://");
    if (!url) return;

    if (selected) {
      // Wrap the selected text as the link label.
      insertAtCursor(`[${selected}](${url})`);
    } else {
      // No selection — insert placeholder label text, pre-selected for easy editing.
      const label = "link text";
      insertAtCursor(`[${label}](${url})`, { start: 1, end: 1 + label.length });
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

  async function onImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await compressImage(file);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, dataBase64: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Image upload failed.");
        return;
      }
      insertAtCursor(
        `\n\n<Img src="${data.path}" alt="${file.name.replace(/\.[^.]+$/, "")}" size="${imageSize}" align="${imageAlign}" />\n\n`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body = {
      title,
      slug,
      date,
      excerpt,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      draft,
      content,
    };

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
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
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
      </Field>

      <Field label="Date">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Excerpt">
        <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={inputClass} />
      </Field>

      <Field label="Tags (comma separated)">
        <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
      </Field>

      <label className="flex items-center gap-2 font-mono text-sm text-text-muted">
        <input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} />
        Save as draft (won&apos;t show on the live blog)
      </label>

      <Field label="Content (Markdown / MDX)">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="border border-border px-3 py-1.5 font-mono text-xs text-text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "+ Insert image"}
          </button>

          <button
            type="button"
            onClick={onAddLink}
            className="border border-border px-3 py-1.5 font-mono text-xs text-text-muted transition-colors hover:border-accent hover:text-accent"
          >
            + Add link
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
        </div>
        <p className="mb-2 font-mono text-[11px] text-text-faint">
          Photos are resized automatically before upload. You can also hand-edit the
          size / align attributes on any &lt;Img&gt; tag directly in the text below.
        </p>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          className={`${inputClass} font-mono`}
        />
      </Field>

      {error && <p className="font-mono text-sm text-accent">{error}</p>}

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={onPreview}
          disabled={previewLoading || !content.trim()}
          className="border border-border px-4 py-2 font-mono text-sm text-text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {previewLoading ? "Rendering…" : "Preview"}
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
          tags={tags.split(",").map((t) => t.trim()).filter(Boolean)}
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
