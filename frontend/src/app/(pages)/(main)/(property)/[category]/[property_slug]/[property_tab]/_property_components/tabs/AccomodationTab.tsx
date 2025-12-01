import { AccommodationProps } from "@/types/types";
import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Image from "next/image";
import ReadMoreLess from "@/components/read-more/ReadMoreLess";

export default function AccommodationTab({
  accommodations,
}: {
  accommodations: AccommodationProps[];
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentAccIndex, setCurrentAccIndex] = useState<number | null>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  console.log("accomodationtab", accommodations);

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-8 max-w-5xl mx-auto">
        {accommodations.map((acc, accIndex) => {
          const webpImages = acc.accomodation_images.filter((img) =>
            img.toLowerCase().endsWith(".webp")
          );

          return (
            <div
              key={accIndex}
              className="bg-gray-50/80 p-6 rounded-xl shadow-xs hover:shadow-sm transition"
            >
              <h2 className="text-xl font-semibold text-purple-700">
                {acc.accomodation_name}
              </h2>
              {acc.accomodation_price?.DOLLAR && (
                <p className="text-gray-600 mt-1 font-medium">
                  {acc.accomodation_price?.DOLLAR}
                </p>
              )}
              <ReadMoreLess htmlText={acc?.accomodation_description} />

              {/* Images (only webp) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {webpImages.map((img, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="relative w-full h-32 rounded-lg cursor-pointer overflow-hidden shadow-sm transition hover:scale-105"
                    onClick={() => {
                      setCurrentAccIndex(accIndex);
                      setCurrentImgIndex(imgIndex);
                      setLightboxOpen(true);
                    }}
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${img}`}
                      alt={`${acc.accomodation_name} ${imgIndex + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {currentAccIndex !== null && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={currentImgIndex}
          slides={accommodations[currentAccIndex].accomodation_images
            .filter((img) => img.toLowerCase().endsWith(".webp"))
            .map((src) => ({
              src: `${process.env.NEXT_PUBLIC_MEDIA_URL}/${src}`,
            }))}
          plugins={[Thumbnails, Zoom, Fullscreen, Slideshow, Counter]}
        />
      )}
    </div>
  );
}
