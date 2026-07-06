"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function PhotoModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const close = () => router.back();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    // Plain `overflow: hidden` on body is unreliable on mobile Safari/Chrome —
    // touch scrolling can still leak through, which shifts the viewport as the
    // browser's address bar hides/shows, making "fixed" elements like the
    // close button appear to drift or vanish. Locking the body itself with
    // position:fixed (restoring the scroll offset on close) is the robust fix.
    const scrollY = window.scrollY;
    const { body } = document;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";

    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      window.scrollTo(0, scrollY);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm sm:p-8"
      onClick={close}
    >
      <button
        onClick={close}
        aria-label="Close"
        className="fixed right-4 top-4 z-[110] font-mono text-xs uppercase tracking-wide text-text-muted transition-colors hover:text-text sm:right-8 sm:top-8"
      >
        Close ✕
      </button>
      <div
        className="max-h-full w-full max-w-5xl overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
