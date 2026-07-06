import { notFound } from "next/navigation";
import { PhotoDetail } from "@/components/photography/PhotoDetail";
import { PhotoModal } from "@/components/photography/PhotoModal";
import { getPhoto } from "@/lib/photography";

export default function InterceptedPhotoModal({
  params,
}: {
  params: { slug: string };
}) {
  const photo = getPhoto(params.slug);
  if (!photo) notFound();

  return (
    <PhotoModal>
      <PhotoDetail photo={photo} />
    </PhotoModal>
  );
}
