import { useCallback, useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Skeleton from "react-loading-skeleton";
import { GalleryProps, PropertyProps } from "@/types/types";
import Image from "next/image";

interface Slide {
  src: string;
  alt?: string;
  title?: string;
}

export default function GalleryTab({
  property,
}: {
  property: PropertyProps | null;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [currentSlides, setCurrentSlides] = useState<Slide[]>([]);
  const [galleries, setGalleries] = useState<GalleryProps[]>([]);
  const [loading, setLoading] = useState(true);

  const getGalleries = useCallback(async () => {
    if (!property?.gallery) return;
    setLoading(true);
    try {
      const data = property?.gallery;
      const finalData: GalleryProps[] = (data || []).map((item: any) => {
        // Handle case where gallery is a simple array of image URLs
        if (typeof item === "string") {
          return {
            title: "Gallery",
            gallery: item.toLowerCase().endsWith(".webp")
              ? [`${process.env.NEXT_PUBLIC_MEDIA_URL}/${item}`]
              : [],
          };
        }

        // Handle structured gallery object
        const galleryArray = Array.isArray(item?.gallery) ? item.gallery : [];

        return {
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
      });

      setGalleries(finalData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [property?.gallery]);

  useEffect(() => {
    getGalleries();
  }, [getGalleries]);

  const handleOpen = (gallery: GalleryProps, i: number) => {
    const slides = gallery?.gallery?.map((img) => ({
      src: img,
      alt: `${gallery?.title}-${i}`,
      title: `${gallery?.title}-${i}`,
    }));
    setCurrentSlides(slides);
    setIndex(i);
    setOpen(true);
  };

  if (loading) {
    return (
      <div>
        {[1, 2].map((g, idx) => (
          <div key={idx} className="border-t border-gray-200 p-4">
            <Skeleton height={24} width={200} className="mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {galleries?.map((gallery, gIdx) => (
        <div key={gIdx} className="border-t border-gray-200">
          {/* Gallery Title */}
          <h2 className="text-xl text-gray-600 p-4 capitalize ">
            {gallery.title}
          </h2>

          {/* Grid of max 8 images, 4 per row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 pt-0">
            {gallery?.gallery?.map((img, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden shadow rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleOpen(gallery, i)}
              >
                <Image
                  src={img}
                  alt={`${gallery?.title}-${i}`}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Lightbox */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={currentSlides}
        plugins={[Thumbnails, Zoom, Fullscreen, Slideshow, Counter]}
      />
    </div>
  );
}
