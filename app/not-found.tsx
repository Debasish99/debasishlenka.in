import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-start justify-center px-6">
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-accent">404</p>
      <h1 className="mt-3 font-display text-4xl text-text">Nothing here.</h1>
      <p className="mt-3 text-text-muted">
        This page doesn&apos;t exist — maybe it moved, maybe it never did.
      </p>
      <Link
        href="/"
        className="mt-8 font-mono text-sm text-text-muted transition-colors hover:text-accent"
      >
        ← Back home
      </Link>
    </div>
  );
}
