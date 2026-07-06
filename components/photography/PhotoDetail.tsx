import Image from "next/image";
import { formatExifDate, formatExifLine, type Photo } from "@/lib/photography";

/**
 * Shared detail view — used both inside the intercepted modal
 * (/photography/@modal/(.)photo/[slug]) and the full-page fallback
 * (/photography/photo/[slug]) so the two never drift apart.
 */
export function PhotoDetail({ photo }: { photo: Photo }) {
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px] md:gap-10">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-bg-raised md:aspect-auto md:h-[80vh]">
        <Image
          src={photo.src}
          alt={photo.caption}
          fill
          sizes="(max-width: 768px) 100vw, 70vw"
          className="object-contain"
          priority
        />
      </div>
      <div className="flex flex-col gap-4 py-2 font-mono text-xs text-text-muted">
        <p className="text-sm text-text">{photo.caption}</p>
        <dl className="space-y-2">
          <Row label="Date" value={formatExifDate(photo.exif)} />
          {photo.exif.camera && <Row label="Camera" value={photo.exif.camera} />}
          {photo.exif.lens && <Row label="Lens" value={photo.exif.lens} />}
          <Row label="Settings" value={formatExifLine(photo.exif)} />
          {photo.exif.focalLength && (
            <Row label="Focal length" value={photo.exif.focalLength} />
          )}
        </dl>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2">
      <dt className="text-text-faint">{label}</dt>
      <dd className="text-right text-text-muted">{value}</dd>
    </div>
  );
}
