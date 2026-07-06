/**
 * Add Photos script
 * ------------------------------------------------------------------
 * Drop new image files into content/photography/incoming/, then run:
 *
 *   npm run add-photos
 *
 * For each image, this script:
 *   1. Reads EXIF data straight from the file (date, camera, lens,
 *      ISO, shutter speed, aperture, focal length) — no manual typing
 *   2. Reads the image's real pixel dimensions
 *   3. Moves the file into public/photography/<slug>.<ext>
 *   4. Appends an entry to content/photography/photos.json with an
 *      empty caption for you to fill in, and folio: null (assign a
 *      folio afterwards by editing photos.json if it belongs to one)
 *
 * Safe to re-run — already-processed files are skipped.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import exifr from "exifr";
import sizeOf from "image-size";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const INCOMING_DIR = path.join(ROOT, "content/photography/incoming");
const PUBLIC_DIR = path.join(ROOT, "public/photography");
const PHOTOS_JSON = path.join(ROOT, "content/photography/photos.json");

const VALID_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

function loadPhotos() {
  if (!fs.existsSync(PHOTOS_JSON)) return [];
  return JSON.parse(fs.readFileSync(PHOTOS_JSON, "utf-8"));
}

function savePhotos(photos) {
  fs.writeFileSync(PHOTOS_JSON, JSON.stringify(photos, null, 2) + "\n");
}

function slugify(filename) {
  const base = path.basename(filename, path.extname(filename));
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSlug(base, existingSlugs) {
  let slug = base || "photo";
  let counter = 2;
  while (existingSlugs.has(slug)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

/** Converts a decimal seconds exposure time into a "1/250" style string. */
function formatShutterSpeed(exposureTime) {
  if (!exposureTime) return undefined;
  if (exposureTime >= 1) return `${exposureTime}`;
  return `1/${Math.round(1 / exposureTime)}`;
}

/** Formats a Date the way it was written to the file, without shifting timezone. */
function formatDateTaken(date) {
  if (!date) return new Date().toISOString();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

async function extractExif(buffer) {
  try {
    const data = await exifr.parse(buffer, {
      pick: [
        "Make",
        "Model",
        "LensModel",
        "ISO",
        "ExposureTime",
        "FNumber",
        "FocalLength",
        "DateTimeOriginal",
        "CreateDate",
      ],
    });
    if (!data) return {};

    const camera = [data.Make, data.Model].filter(Boolean).join(" ").trim();
    const exif = {
      dateTaken: formatDateTaken(data.DateTimeOriginal ?? data.CreateDate),
      camera: camera || undefined,
      lens: data.LensModel || undefined,
      iso: data.ISO || undefined,
      shutterSpeed: formatShutterSpeed(data.ExposureTime),
      aperture: data.FNumber ? `f/${data.FNumber}` : undefined,
      focalLength: data.FocalLength ? `${Math.round(data.FocalLength)}mm` : undefined,
    };
    // Drop undefined keys so JSON stays clean
    Object.keys(exif).forEach((k) => exif[k] === undefined && delete exif[k]);
    return exif;
  } catch (err) {
    console.warn(`  ⚠ Could not read EXIF (${err.message}) — using file date instead`);
    return { dateTaken: new Date().toISOString() };
  }
}

async function main() {
  if (!fs.existsSync(INCOMING_DIR)) {
    console.log(`No incoming folder found at ${INCOMING_DIR} — nothing to do.`);
    return;
  }
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const files = fs
    .readdirSync(INCOMING_DIR)
    .filter((f) => VALID_EXTENSIONS.has(path.extname(f).toLowerCase()));

  if (files.length === 0) {
    console.log("No images found in content/photography/incoming/. Drop some in and re-run.");
    return;
  }

  const photos = loadPhotos();
  const existingSlugs = new Set(photos.map((p) => p.slug));

  let added = 0;

  for (const file of files) {
    const fullPath = path.join(INCOMING_DIR, file);
    const buffer = fs.readFileSync(fullPath);
    const ext = path.extname(file).toLowerCase();

    const baseSlug = slugify(file);
    const slug = uniqueSlug(baseSlug, existingSlugs);
    existingSlugs.add(slug);

    console.log(`Processing ${file} → ${slug}${ext}`);

    const { width, height } = sizeOf(buffer);
    const exif = await extractExif(buffer);

    const destPath = path.join(PUBLIC_DIR, `${slug}${ext}`);
    fs.copyFileSync(fullPath, destPath);
    fs.unlinkSync(fullPath);

    photos.push({
      slug,
      src: `/photography/${slug}${ext}`,
      width,
      height,
      caption: "",
      folio: null,
      exif,
    });

    added += 1;
  }

  savePhotos(photos);

  console.log(`\nDone — added ${added} photo(s) to content/photography/photos.json.`);
  console.log("Next: open that file and fill in the empty \"caption\" fields");
  console.log('(and set "folio" to a folio slug from folios.json, if it belongs to one).');
}

main();
