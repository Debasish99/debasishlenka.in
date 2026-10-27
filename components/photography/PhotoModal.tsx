"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  prevHref?: string | null;
  nextHref?: string | null;
};

export function PhotoModal({ children, prevHref, nextHref }: Props) {
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);

  // router.back() is the pattern Next.js's intercepting routes actually
  // expect for dismissing the modal reliably — the underlying grid page
  // stays mounted the whole time the modal is open, and back() is what
  // properly collapses the modal slot back to nothing. Navigating via
  // push/replace to a different URL doesn't reliably trigger that.
  //
  // prev/next use replace() so browsing through several photos doesn't
  // stack up extra history entries — that way close() only ever needs
  // to undo ONE step to land back on the grid/folio, regardless of how
  // many photos you clicked through first.
  const close = () => router.back();
  const goPrev = () => prevHref && router.replace(prevHref, { scroll: false });
  const goNext = () => nextHref && router.replace(nextHref, { scroll: false });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
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
  }, [prevHref, nextHref]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const SWIPE_THRESHOLD = 60;
    if (deltaX > SWIPE_THRESHOLD) goPrev();
    else if (deltaX < -SWIPE_THRESHOLD) goNext();
    touchStartX.current = null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm sm:p-8"
      onClick={close}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button
        onClick={(e) => {
          // The overlay behind this button also closes on click. Without
          // stopPropagation the click fires close() twice -> two history
          // steps back -> you skip past /photography and land on the page before it.
          e.stopPropagation();
          close();
        }}
        aria-label="Close"
        className="fixed right-4 top-4 z-[110] font-mono text-xs uppercase tracking-wide text-text-muted transition-colors hover:text-text sm:right-8 sm:top-8"
      >
        Close ✕
      </button>

      {prevHref && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Previous photo"
          className="fixed left-2 top-1/2 z-[110] -translate-y-1/2 px-3 py-4 text-2xl text-text-muted transition-colors hover:text-accent sm:left-4"
        >
          ‹
        </button>
      )}
      {nextHref && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Next photo"
          className="fixed right-2 top-1/2 z-[110] -translate-y-1/2 px-3 py-4 text-2xl text-text-muted transition-colors hover:text-accent sm:right-4"
        >
          ›
        </button>
      )}

      <div
        className="max-h-full w-full max-w-5xl overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
