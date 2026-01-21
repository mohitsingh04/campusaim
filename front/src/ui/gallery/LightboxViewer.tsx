"use client";

import { useState } from "react";
import Image from "next/image";

import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Counter from "yet-another-react-lightbox/plugins/counter";

interface LightboxViewerProps {
  images: string[];
  title?: string;
}

export default function LightboxViewer({
  images,
  title = "Gallery",
}: LightboxViewerProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const slides = images.map((img, i) => ({
    src: img,
    alt: `${title}-${i}`,
    title: `${title}-${i}`,
  }));

  const handleOpen = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  return (
    <div>
      {/* --- IMAGE GRID INSIDE LIGHTBOX COMPONENT --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <div
            key={i}
            className="relative w-full aspect-square overflow-hidden shadow rounded-custom cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => handleOpen(i)}
          >
            <Image
              src={img}
              alt={`${title}-${i}`}
              fill
              className="object-cover transition-transform duration-300 scale-105 hover:scale-110"
            />
          </div>
        ))}
      </div>

      {/* --- LIGHTBOX MODAL --- */}
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
