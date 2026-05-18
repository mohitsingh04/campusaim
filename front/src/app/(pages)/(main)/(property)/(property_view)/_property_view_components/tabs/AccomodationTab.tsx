"use client";
import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import {
  PropertyAccommodationProps,
  PropertyProps,
} from "@/types/PropertyTypes";
import LightboxViewer from "@/ui/gallery/LightboxViewer";
import HeadingLine from "@/ui/headings/HeadingLine";
import TabLoading from "@/ui/loader/component/TabLoading";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { useQuery } from "@tanstack/react-query";

export default function AccommodationTab({
  property,
}: {
  property: PropertyProps | null;
}) {
  const { data: allAccommodations = [], isLoading } = useQuery<
    PropertyAccommodationProps[]
  >({
    queryKey: ["accommodations", property?._id],
    queryFn: async () => {
      if (!property?._id) return [];

      try {
        const response = await API.get(`/accomodation/${property._id}`);
        const data = response.data || [];

        const finalData: PropertyAccommodationProps[] = data.map(
          (item: PropertyAccommodationProps) => {
            const imagesArray = Array.isArray(item?.accomodation_images)
              ? item.accomodation_images
              : [];

            return {
              ...item,
              accomodation_images: imagesArray
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
    <div className="space-y-3">
      <div className="space-y-6 max-w-6xl mx-auto">
        {allAccommodations.map((acc, accIndex) => (
          <div key={accIndex} className="p-5 shadow-custom transition">
            <HeadingLine title={acc?.accomodation_name} />
            <ReadMoreLess html={acc?.accomodation_description} />
            <div className="pt-4">
              <LightboxViewer images={acc?.accomodation_images || []} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
