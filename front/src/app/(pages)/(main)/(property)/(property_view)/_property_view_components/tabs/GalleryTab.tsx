import { PropertyGalleryProps, PropertyProps } from "@/types/PropertyTypes";
import LightboxViewer from "@/ui/gallery/LightboxViewer";
import HeadingLine from "@/ui/headings/HeadingLine";
import { getErrorResponse } from "@/context/Callbacks";
import { useQuery } from "@tanstack/react-query";
import API from "@/context/API";
import TabLoading from "@/ui/loader/component/TabLoading";

export default function GalleryTab({
  property,
}: {
  property: PropertyProps | null;
}) {
  const { data: allgalleries = [], isLoading } = useQuery<
    PropertyGalleryProps[]
  >({
    queryKey: ["property-gallery", property?._id],
    queryFn: async () => {
      if (!property?._id) return [];

      try {
        const response = await API.get(`/property/gallery/${property._id}`);
        const data = response.data;

        const finalData: PropertyGalleryProps[] = (data || []).map(
          (gal: PropertyGalleryProps) => {
            return {
              ...gal,
              gallery: (gal.gallery || [])
                .filter(
                  (img: string) =>
                    typeof img === "string" &&
                    img.toLowerCase().endsWith(".webp"),
                )
                .map(
                  (img: string) =>
                    `${process.env.NEXT_PUBLIC_MEDIA_URL}/${img}`,
                ),
            };
          },
        );

        return finalData;
      } catch (error) {
        getErrorResponse(error, true);
        throw error;
      }
    },
    enabled: !!property?._id,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <TabLoading />;

  return (
    <div>
      {allgalleries?.map((gallery, gIdx) => (
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
