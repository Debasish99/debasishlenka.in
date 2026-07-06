import Link from "next/link";
import Image from "next/image";
import type { Experiment } from "@/lib/lab";

const statusColor: Record<Experiment["status"], string> = {
  ongoing: "text-accent",
  planned: "text-text-faint",
  done: "text-text-muted",
};

export function ExperimentCard({ experiment }: { experiment: Experiment }) {
  return (
    <Link
      href={`/lab/${experiment.slug}`}
      className="group flex flex-col border border-border p-6 transition-colors hover:border-accent"
    >
      {experiment.coverImage && (
        <div className="relative mb-4 aspect-video w-full overflow-hidden bg-bg-raised">
          <Image
            src={experiment.coverImage}
            alt={experiment.title}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <p
        className={`font-mono text-[11px] uppercase tracking-[0.1em] ${statusColor[experiment.status]}`}
      >
        {experiment.status}
      </p>
      <h3 className="mt-2 font-display text-xl text-text transition-colors group-hover:text-accent">
        {experiment.title}
      </h3>
      <p className="mt-2 text-sm text-text-muted">{experiment.summary}</p>
      {experiment.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {experiment.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-text-faint"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}
