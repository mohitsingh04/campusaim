import { useCallback, useEffect, useState } from "react";
import { PropertyGalleryProps, PropertyProps } from "@/types/PropertyTypes";
import LightboxViewer from "@/ui/gallery/LightboxViewer";
import HeadingLine from "@/ui/headings/HeadingLine";
import { getErrorResponse } from "@/context/Callbacks";
import Loading from "@/ui/loader/Loading";

export default function GalleryTab({
  property,
}: {
  property: PropertyProps | null;
}) {
  const [galleries, setGalleries] = useState<PropertyGalleryProps[]>([]);
  const [loading, setLoading] = useState(true);

  const getGalleries = useCallback(async () => {
    if (!property?.gallery) return;
    setLoading(true);

    try {
      const data = property.gallery;

      const finalData: PropertyGalleryProps[] = (data || []).map(
        (item: any) => {
          const property_id = property?._id || "";

          // Case 1: gallery item is a simple string
          if (typeof item === "string") {
            return {
              property_id,
              title: "Gallery",
              gallery: item.toLowerCase().endsWith(".webp")
                ? [`${process.env.NEXT_PUBLIC_MEDIA_URL}/${item}`]
                : [],
            };
          }

          // Case 2: gallery item is an object
          const galleryArray = Array.isArray(item?.gallery) ? item.gallery : [];

          return {
            property_id,
            title: item?.title || "Gallery",
            gallery: galleryArray
              .filter(
                (img: string) =>
                  typeof img === "string" && img.toLowerCase().endsWith(".webp")
              )
              .map(
                (img: string) => `${process.env.NEXT_PUBLIC_MEDIA_URL}/${img}`
              ),
          };
        }
      );

      setGalleries(finalData);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [property?.gallery, property?._id]);

  useEffect(() => {
    getGalleries();
  }, [getGalleries]);

  if (loading) return <Loading />;

  return (
    <div>
      {galleries?.map((gallery, gIdx) => (
        <div key={gIdx}>
          <HeadingLine
            title={gallery?.title}
            className="px-4 pt-4 font-medium text-(--text-color-emphasis)"
          />
          <div className="px-4 pb-4">
            <LightboxViewer images={gallery.gallery} />
          </div>
        </div>
      ))}
    </div>
  );
}
