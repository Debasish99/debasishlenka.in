import Link from "next/link";

const worlds = [
  {
    tag: "Frame",
    title: "Photography",
    copy: "Unscripted moments, shot on whatever camera's in reach. A running archive, not a portfolio pitch.",
    cta: "View the photos",
    href: "/photography",
  },
  {
    tag: "Fix",
    title: "Work",
    copy: "Windows Server, Active Directory, Linux, Azure, VMware — the infrastructure work that keeps things quietly running.",
    cta: "See the work",
    href: "/work",
  },
  {
    tag: "Build",
    title: "Lab",
    copy: "Side projects, vibe-coded experiments, and whatever I'm tinkering with this week.",
    cta: "Poke around",
    href: "/lab",
  },
];

export default function WorldsNav() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-20 md:py-28 border-t border-border">
      <div className="flex items-center gap-4 mb-10">
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-text-faint whitespace-nowrap">
          Where to go from here
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {worlds.map((world) => (
          <Link
            key={world.title}
            href={world.href}
            className="group bg-bg-raised border border-border rounded-md p-8 flex flex-col justify-between hover:border-accent transition-colors"
          >
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.12em] text-text-faint group-hover:text-accent transition-colors block mb-4">
                {world.tag}
              </span>
              <h3 className="font-display font-medium text-2xl mb-3">
                {world.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {world.copy}
              </p>
            </div>
            <span className="mt-8 text-sm font-medium inline-flex items-center gap-2 group-hover:text-accent transition-colors">
              {world.cta}{" "}
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
