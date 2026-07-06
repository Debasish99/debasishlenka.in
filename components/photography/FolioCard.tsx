import Image from "next/image";
import Link from "next/link";
import { getPhoto, type Folio } from "@/lib/photography";

export function FolioCard({ folio }: { folio: Folio }) {
  const cover = getPhoto(folio.coverPhoto);
  return (
    <Link
      href={`/photography/${folio.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden bg-bg-raised"
    >
      {cover && (
        <Image
          src={cover.src}
          alt={folio.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent">
          Folio
        </p>
        <h3 className="mt-1 font-display text-2xl text-text">{folio.title}</h3>
      </div>
    </Link>
  );
}
