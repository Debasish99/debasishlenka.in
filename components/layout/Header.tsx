"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav, site } from "@/lib/constants";

export function Header() {
  const [first, second] = site.name.split(" ");
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu automatically on route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navItems = primaryNav.filter((item) => item.href !== "/");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="font-mono text-sm tracking-tight">
          {first?.toLowerCase()}
          <span className="text-accent">.</span>
          {second?.toLowerCase()}
        </Link>

        {/* Desktop nav — unchanged */}
        <nav className="hidden gap-8 font-mono text-xs uppercase tracking-[0.08em] sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-text-muted transition-colors hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger toggle — hidden on desktop */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] sm:hidden"
        >
          <span
            className={`h-px w-5 bg-text transition-transform ${
              menuOpen ? "translate-y-[6px] rotate-45" : ""
            }`}
          />
          <span className={`h-px w-5 bg-text transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span
            className={`h-px w-5 bg-text transition-transform ${
              menuOpen ? "-translate-y-[6px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <nav className="flex flex-col border-t border-border bg-bg px-6 py-4 font-mono text-sm uppercase tracking-[0.08em] sm:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-b border-border py-4 text-text-muted last:border-b-0 transition-colors hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
