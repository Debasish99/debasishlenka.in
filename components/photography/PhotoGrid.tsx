"use client";

import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/lib/photography";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2 md:grid-cols-4 lg:grid-cols-5">
      {photos.map((photo) => (
        <Link
          key={photo.slug}
          href={`/photography/photo/${photo.slug}`}
          scroll={false}
          className="group relative block aspect-square overflow-hidden bg-bg-raised"
        >
          <Image
            src={photo.src}
            alt={photo.caption}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="font-mono text-[11px] text-text">{photo.caption}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
