import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PhotoDetail } from "@/components/photography/PhotoDetail";
import { getAllPhotos, getPhoto, getPhotoNav } from "@/lib/photography";

type Props = {
  params: { slug: string };
  searchParams: { context?: string };
};

export function generateStaticParams() {
  return getAllPhotos().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const photo = getPhoto(params.slug);
  return { title: photo ? photo.caption : "Photo" };
}

function hrefFor(slug: string, context?: string) {
  return context ? `/photography/photo/${slug}?context=${context}` : `/photography/photo/${slug}`;
}

/**
 * Full-page fallback — used on direct navigation / refresh / shared links.
 * When reached by clicking a photo from within /photography, Next.js
 * intercepts and renders the @modal version instead of this.
 */
export default function PhotoPage({ params, searchParams }: Props) {
  const photo = getPhoto(params.slug);
  if (!photo) notFound();

  const context = searchParams.context;
  const { prev, next } = getPhotoNav(params.slug, context);

  return (
    <Container className="pb-24 pt-20 md:pt-28">
      <Link
        href="/photography"
        className="mb-8 inline-block font-mono text-xs uppercase tracking-wide text-text-muted transition-colors hover:text-text"
      >
        ← All photography
      </Link>
      <PhotoDetail photo={photo} />
      <div className="mt-10 flex justify-between font-mono text-sm text-text-muted">
        {prev ? (
          <Link href={hrefFor(prev, context)} className="transition-colors hover:text-accent">
            ‹ Previous
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={hrefFor(next, context)} className="transition-colors hover:text-accent">
            Next ›
          </Link>
        ) : (
          <span />
        )}
      </div>
    </Container>
  );
}
