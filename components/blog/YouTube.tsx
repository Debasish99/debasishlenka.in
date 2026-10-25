/**
 * Responsive YouTube embed for blog posts.
 * Usage in a post:  <YouTube id="dQw4w9WgXcQ" title="Optional title" />
 */
export function YouTube({ id, title = "YouTube video" }: { id: string; title?: string }) {
  if (!/^[A-Za-z0-9_-]{6,15}$/.test(id)) return null;
  return (
    <div className="not-prose relative my-6 aspect-video w-full overflow-hidden rounded bg-bg-raised">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
        loading="lazy"
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
