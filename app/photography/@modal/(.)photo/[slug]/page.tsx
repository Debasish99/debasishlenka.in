import { notFound } from "next/navigation";
import { PhotoDetail } from "@/components/photography/PhotoDetail";
import { PhotoModal } from "@/components/photography/PhotoModal";
import { getPhoto, getPhotoNav } from "@/lib/photography";

type Props = {
  params: { slug: string };
  searchParams: { context?: string };
};

function hrefFor(slug: string, context?: string) {
  return context ? `/photography/photo/${slug}?context=${context}` : `/photography/photo/${slug}`;
}

export default function InterceptedPhotoModal({ params, searchParams }: Props) {
  const photo = getPhoto(params.slug);
  if (!photo) notFound();

  const context = searchParams.context;
  const { prev, next } = getPhotoNav(params.slug, context);

  return (
    <PhotoModal
      prevHref={prev ? hrefFor(prev, context) : null}
      nextHref={next ? hrefFor(next, context) : null}
    >
      <PhotoDetail photo={photo} />
    </PhotoModal>
  );
}
