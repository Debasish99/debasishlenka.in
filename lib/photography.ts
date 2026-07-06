import photosData from "@/content/photography/photos.json";
import foliosData from "@/content/photography/folios.json";

export type PhotoExif = {
  dateTaken: string;
  camera?: string;
  lens?: string;
  iso?: number;
  shutterSpeed?: string;
  aperture?: string;
  focalLength?: string;
};

export type Photo = {
  slug: string;
  src: string;
  width: number;
  height: number;
  caption: string;
  folio: string | null;
  exif: PhotoExif;
};

export type Folio = {
  slug: string;
  title: string;
  description: string;
  coverPhoto: string;
};

const photos = photosData as Photo[];
const folios = foliosData as Folio[];

/** All photos, newest first — powers the main grid. */
export function getAllPhotos(): Photo[] {
  return [...photos].sort(
    (a, b) =>
      new Date(b.exif.dateTaken).getTime() - new Date(a.exif.dateTaken).getTime()
  );
}

export function getPhoto(slug: string): Photo | undefined {
  return photos.find((p) => p.slug === slug);
}

export function getFolios(): Folio[] {
  return folios;
}

export function getFolio(slug: string): Folio | undefined {
  return folios.find((f) => f.slug === slug);
}

export function getPhotosByFolio(slug: string): Photo[] {
  return getAllPhotos().filter((p) => p.folio === slug);
}

/** Formats EXIF shutter/ISO/aperture into a single readable line. */
export function formatExifLine(exif: PhotoExif): string {
  const parts = [
    exif.aperture,
    exif.shutterSpeed && `${exif.shutterSpeed}s`,
    exif.iso && `ISO ${exif.iso}`,
  ].filter(Boolean);
  return parts.join(" · ");
}

export function formatExifDate(exif: PhotoExif): string {
  const d = new Date(exif.dateTaken);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
