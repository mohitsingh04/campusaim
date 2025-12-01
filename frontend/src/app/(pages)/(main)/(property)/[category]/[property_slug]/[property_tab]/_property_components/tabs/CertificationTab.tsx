import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Skeleton from "react-loading-skeleton";
import Image from "next/image";

interface CertificationTabProps {
  images: string[] | null;
}

interface Slide {
  src: string;
  alt?: string;
}

export default function CertificationTab({ images }: CertificationTabProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (!images) {
    return (
      <div className="p-4">
        <Skeleton height={24} width={200} className="mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const filteredImages = images.filter((img) =>
    img?.toLowerCase().endsWith(".webp")
  );

  const slides: Slide[] = filteredImages.map((img, i) => ({
    src: `${process.env.NEXT_PUBLIC_MEDIA_URL}${img}`,
    alt: `Certification-${i}`,
  }));

  return (
    <div className="border-t border-gray-200">
      {/* Grid of images */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {filteredImages.map((img, i) => (
          <div
            key={i}
            className="relative aspect-square overflow-hidden shadow rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_MEDIA_URL}${img}`}
              alt={`Certification-${i}`}
              fill
              className="object-cover transition-transform duration-300 hover:scale-110"
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
        plugins={[Thumbnails, Zoom, Fullscreen, Slideshow, Counter]}
      />
    </div>
  );
}
