import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FolioCard } from "@/components/photography/FolioCard";
import { PhotoGrid } from "@/components/photography/PhotoGrid";
import { getAllPhotos, getFolios } from "@/lib/photography";

export const metadata: Metadata = { title: "Photography" };

export default function PhotographyPage() {
  const folios = getFolios();
  const photos = getAllPhotos();

  return (
    <>
      <Container className="pb-12 pt-20 md:pt-28">
        <SectionHeading
          eyebrow="Photography"
          title="Photography"
          description="Folios below are curated collections. Everything I shoot ends up in the grid further down."
        />
      </Container>

      {folios.length > 0 && (
        <Container className="pb-16">
          <div className="grid gap-3 sm:grid-cols-2">
            {folios.map((folio) => (
              <FolioCard key={folio.slug} folio={folio} />
            ))}
          </div>
        </Container>
      )}

      <Container className="pb-24">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.1em] text-text-faint">
          All photos
        </p>
        <PhotoGrid photos={photos} />
      </Container>
    </>
  );
}
