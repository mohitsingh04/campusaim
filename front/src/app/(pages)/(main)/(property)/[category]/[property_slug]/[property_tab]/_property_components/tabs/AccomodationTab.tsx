"use client";
import { getErrorResponse } from "@/context/Callbacks";
import {
  PropertyAccommodationProps,
  PropertyProps,
} from "@/types/PropertyTypes";
import LightboxViewer from "@/ui/gallery/LightboxViewer";
import HeadingLine from "@/ui/headings/HeadingLine";
import Loading from "@/ui/loader/Loading";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { useCallback, useEffect, useState } from "react";

export default function AccommodationTab({
  property,
}: {
  property: PropertyProps | null;
}) {
  const [accommodations, setAccommodations] = useState<
    PropertyAccommodationProps[]
  >([]);
  const [loading, setLoading] = useState(true);

  const getAccomodation = useCallback(async () => {
    if (!property?.accomodation) return;
    setLoading(true);

    try {
      const data = property.accomodation;

      const finalData: PropertyAccommodationProps[] = (data || []).map(
        (item: PropertyAccommodationProps) => {
          const accomodationImagesArray = Array.isArray(
            item?.accomodation_images
          )
            ? item.accomodation_images
            : [];

          return {
            ...item,
            accomodation_images: accomodationImagesArray
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

      setAccommodations(finalData);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [property?.accomodation]);

  useEffect(() => {
    getAccomodation();
  }, [getAccomodation]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-3">
      <div className="space-y-6 max-w-6xl mx-auto">
        {accommodations.map((acc, accIndex) => (
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
