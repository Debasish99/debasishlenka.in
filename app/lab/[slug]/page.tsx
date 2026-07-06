import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { getExperiment, getExperiments } from "@/lib/lab";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getExperiments().map((e) => ({ slug: e.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const experiment = getExperiment(params.slug);
  return { title: experiment ? experiment.title : "Lab" };
}

const statusColor: Record<string, string> = {
  ongoing: "text-accent",
  planned: "text-text-faint",
  done: "text-text-muted",
};

export default function ExperimentPage({ params }: Props) {
  const experiment = getExperiment(params.slug);
  if (!experiment) notFound();

  return (
    <Container className="max-w-3xl pb-24 pt-20 md:pt-28">
      <Link
        href="/lab"
        className="mb-8 inline-block font-mono text-xs uppercase tracking-wide text-text-muted transition-colors hover:text-text"
      >
        ← All lab projects
      </Link>

      <p className={`font-mono text-[11px] uppercase tracking-[0.1em] ${statusColor[experiment.status]}`}>
        {experiment.status}
      </p>
      <h1 className="mt-2 font-display text-4xl leading-[1.05] text-text md:text-5xl">
        {experiment.title}
      </h1>

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

      {experiment.coverImage && (
        <div className="relative mt-8 aspect-video w-full overflow-hidden bg-bg-raised">
          <Image
            src={experiment.coverImage}
            alt={experiment.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      {experiment.video && (
        <div className="relative mt-8 aspect-video w-full overflow-hidden bg-bg-raised">
          <iframe
            src={experiment.video}
            title={experiment.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4 text-text-muted">
        {experiment.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {experiment.links.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-4">
          {experiment.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-border px-4 py-2 font-mono text-sm text-text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {link.label} →
            </a>
          ))}
        </div>
      )}
    </Container>
  );
}
