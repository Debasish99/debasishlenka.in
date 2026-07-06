import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { formatExifDate, formatExifLine, getFolio, getFolios, getPhotosByFolio } from "@/lib/photography";

export function generateStaticParams() {
  return getFolios().map((f) => ({ folio: f.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { folio: string };
}): Metadata {
  const folio = getFolio(params.folio);
  return { title: folio ? folio.title : "Photography" };
}

export default function FolioPage({ params }: { params: { folio: string } }) {
  const folio = getFolio(params.folio);
  if (!folio) notFound();
  const photos = getPhotosByFolio(folio.slug);

  return (
    <Container className="pb-24 pt-20 md:pt-28">
      <Link
        href="/photography"
        className="mb-8 inline-block font-mono text-xs uppercase tracking-wide text-text-muted transition-colors hover:text-text"
      >
        ← All photography
      </Link>
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent">Folio</p>
      <h1 className="mt-2 max-w-3xl font-display text-4xl leading-[1.05] md:text-6xl">
        {folio.title}
      </h1>
      <p className="mt-4 max-w-xl text-text-muted">{folio.description}</p>

      <div className="mt-16 flex flex-col gap-16">
        {photos.map((photo) => (
          <figure key={photo.slug} className="flex flex-col gap-3">
            <Link
              href={`/photography/photo/${photo.slug}`}
              scroll={false}
              className="relative block aspect-[3/2] w-full overflow-hidden bg-bg-raised"
            >
              <Image
                src={photo.src}
                alt={photo.caption}
                fill
                sizes="(max-width: 768px) 100vw, 900px"
                className="object-cover"
              />
            </Link>
            <figcaption className="flex flex-wrap justify-between gap-2 font-mono text-xs text-text-faint">
              <span>{photo.caption}</span>
              <span>
                {formatExifDate(photo.exif)} · {formatExifLine(photo.exif)}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Container>
  );
}
