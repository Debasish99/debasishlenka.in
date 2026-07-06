import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PhotoDetail } from "@/components/photography/PhotoDetail";
import { getAllPhotos, getPhoto } from "@/lib/photography";

export function generateStaticParams() {
  return getAllPhotos().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const photo = getPhoto(params.slug);
  return { title: photo ? photo.caption : "Photo" };
}

/**
 * Full-page fallback — used on direct navigation / refresh / shared links.
 * When reached by clicking a photo from within /photography, Next.js
 * intercepts and renders the @modal version instead of this.
 */
export default function PhotoPage({ params }: { params: { slug: string } }) {
  const photo = getPhoto(params.slug);
  if (!photo) notFound();

  return (
    <Container className="pb-24 pt-20 md:pt-28">
      <Link
        href="/photography"
        className="mb-8 inline-block font-mono text-xs uppercase tracking-wide text-text-muted transition-colors hover:text-text"
      >
        ← All photography
      </Link>
      <PhotoDetail photo={photo} />
    </Container>
  );
}
