import { useCallback, useEffect, useState } from "react";
import { PropertyProps } from "../../../../types/types";
import { API } from "../../../../contexts/API";

import Lightbox from "yet-another-react-lightbox";

import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Counter from "yet-another-react-lightbox/plugins/counter";

import AddCertifications from "./AddCertifications";
import RemoveCertifications from "./RemoveCertifications";
import AddNewCertifications from "./AddNewCertifications";
import { getErrorResponse } from "../../../../contexts/Callbacks";

interface CertificationsPageProps {
  property: PropertyProps | null;
}

export default function Certifications({ property }: CertificationsPageProps) {
  const [certification, setCertification] = useState<any>(null);
  const [mode, setMode] = useState<"view" | "add" | "remove">("view");

  const [openLightbox, setOpenLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const getCertifications = useCallback(async () => {
    if (!property?.uniqueId) return;
    try {
      const response = await API.get(`/certifications/${property?.uniqueId}`);
      setCertification(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [property?.uniqueId]);

  useEffect(() => {
    getCertifications();
  }, [getCertifications]);

  // filter only webp images
  const filteredImages =
    certification?.certifications?.filter((img: string) =>
      img.toLowerCase().endsWith(".webp")
    ) || [];

  const slides = filteredImages.map((img: string) => ({
    src: `${import.meta.env.VITE_MEDIA_URL}${img}`,
  }));

  return (
    <div className="p-4">
      {certification ? (
        mode === "view" ? (
          <div>
            {/* Header Section */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--yp-border-primary)]">
              <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
                Certifications
              </h2>
              <div className="flex gap-2">
                {filteredImages.length < 8 && (
                  <button
                    onClick={() => setMode("add")}
                    className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
                  >
                    Add
                  </button>
                )}
                {filteredImages.length > 0 && (
                  <button
                    onClick={() => setMode("remove")}
                    className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {filteredImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredImages.map((img: string, idx: number) => {
                  const fullUrl = `${import.meta.env.VITE_MEDIA_URL}${img}`;
                  return (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden shadow hover:shadow-lg cursor-pointer"
                      onClick={() => {
                        setLightboxIndex(idx);
                        setOpenLightbox(true);
                      }}
                    >
                      <img
                        src={fullUrl}
                        alt={`cert-${idx}`}
                        className="w-full h-48 object-cover bg-[var(--yp-tertiary)]"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-[var(--yp-muted)]">
                No certifications available.
              </div>
            )}

            {/* Lightbox */}
            <Lightbox
              open={openLightbox}
              close={() => setOpenLightbox(false)}
              index={lightboxIndex}
              slides={slides}
              plugins={[Thumbnails, Zoom, Fullscreen, Slideshow, Counter]}
              zoom={{ maxZoomPixelRatio: 10, scrollToZoom: true }}
            />
          </div>
        ) : mode === "add" ? (
          <AddNewCertifications
            property={property}
            getCertifications={getCertifications}
            setAddingMore={setMode}
          />
        ) : (
          <RemoveCertifications
            certifications={certification}
            property={property}
            getCertifications={getCertifications}
            setMode={setMode}
          />
        )
      ) : (
        <AddCertifications
          property={property}
          getCertifications={getCertifications}
        />
      )}
    </div>
  );
}
