import { site } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1200px] flex-col justify-between gap-3 border-t border-border px-6 py-10 font-mono text-xs text-text-faint sm:flex-row md:px-10">
      <span>
        © {new Date().getFullYear()} {site.name}
      </span>
      <span>{site.domain}</span>
    </footer>
  );
}
