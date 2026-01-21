import { useCallback, useEffect, useState } from "react";
import { PropertyProps } from "@/types/PropertyTypes";
import LightboxViewer from "@/ui/gallery/LightboxViewer";
import { getErrorResponse } from "@/context/Callbacks";
import Loading from "@/ui/loader/Loading";

export default function CertificationTab({
  property,
}: {
  property: PropertyProps | null;
}) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const getImages = useCallback(async () => {
    if (!property?.certification) return;
    setLoading(true);

    try {
      const data = property.certification;

      const finalImages: string[] = (data || [])
        .map((item: any) => {
          if (typeof item === "string") {
            // single image string
            return item.toLowerCase().endsWith(".webp")
              ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${item}`
              : null;
          }

          // array inside gallery
          if (Array.isArray(item?.gallery)) {
            return item.gallery
              .filter(
                (img: string) =>
                  typeof img === "string" && img.toLowerCase().endsWith(".webp")
              )
              .map(
                (img: string) => `${process.env.NEXT_PUBLIC_MEDIA_URL}/${img}`
              );
          }

          return null;
        })
        .flat()
        .filter(Boolean) as string[];

      setImages(finalImages);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [property?.certification]);

  useEffect(() => {
    getImages();
  }, [getImages]);

  if (loading) return <Loading />;

  if (images.length === 0) {
    return (
      <div className="p-4 text-(--text-color)">
        No Certification Images Found.
      </div>
    );
  }

  return (
    <div className="p-4">
      <LightboxViewer images={images} />
    </div>
  );
}
