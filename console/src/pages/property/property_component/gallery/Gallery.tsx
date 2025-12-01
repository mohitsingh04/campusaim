import { useCallback, useEffect, useState } from "react";
import { PropertyProps } from "../../../../types/types";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Swal from "sweetalert2";
import AddGallery from "./AddGalleryForm";
import RemoveGalleryImages from "./RemoveImagesFromGallery";
import AddNewGalleryImages from "./AddGalleryImages";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import { Edit } from "lucide-react";
import GalleryTitleEdit from "./GalleryTitleEdit";

interface GalleriesPageProps {
  property: PropertyProps | null;
}

export default function Gallery({ property }: GalleriesPageProps) {
  const [galleries, setGalleries] = useState<any[]>([]);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(
    null
  );
  const [editTitle, setEditTitle] = useState(null);

  const [removeGalleryImages, setRemoveGalleryImages] = useState<any | null>(
    null
  );
  const [addGalleryImages, setAddGalleryImages] = useState<any | null>(null);

  const getGalleries = useCallback(async () => {
    if (!property?.uniqueId) return;
    try {
      const response = await API.get(`/property/gallery/${property?.uniqueId}`);
      setGalleries(response.data || []);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [property?.uniqueId]);

  useEffect(() => {
    getGalleries();
  }, [getGalleries]);

  const getSlides = (gallery: string[]) =>
    gallery
      .filter((img: string) => img.toLowerCase().endsWith(".webp"))
      .map((img: string) => ({
        src: `${import.meta.env.VITE_MEDIA_URL}/${img}`,
      }));
  const handleDeleteGallery = async (galleryId: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the gallery image.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await API.delete(`/gallery/${galleryId}`);

          toast.success(
            response.data.message || "Gallery deleted successfully"
          );
          getGalleries();
        } catch (error) {
          getErrorResponse(error);
        }
      }
    });
  };

  if (removeGalleryImages) {
    return (
      <div className="p-4 space-y-10">
        <RemoveGalleryImages
          gallery={removeGalleryImages}
          property={property}
          getGalleries={getGalleries}
          setRemoveGalleryImages={setRemoveGalleryImages}
        />
      </div>
    );
  }
  if (addGalleryImages) {
    return (
      <div className="p-4 space-y-10">
        <AddNewGalleryImages
          getGalleries={getGalleries}
          setAddingMore={() => setAddGalleryImages(null)}
          gallery={addGalleryImages}
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-10">
      {/* Always show add gallery form */}

      {galleries.length > 0 && (
        <div className="space-y-10">
          {galleries.map((gallery, gIdx) => {
            const filteredImages =
              gallery?.gallery?.filter((img: string) =>
                img.toLowerCase().endsWith(".webp")
              ) || [];

            return (
              <div
                key={gIdx}
                className="bg-[var(--yp-secondary)] p-4 rounded-xl"
              >
                {/* Header Section per gallery */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--yp-border-primary)]">
                  <h2 className="text-lg font-semibold text-[var(--yp-text-primary)] flex items-center gap-2">
                    {gallery.title || `Gallery ${gIdx + 1}`}{" "}
                    <Edit
                      className="w-4 h-4"
                      onClick={() => setEditTitle(gallery)}
                    />
                  </h2>
                  <GalleryTitleEdit
                    isOpen={editTitle}
                    onClose={() => setEditTitle(null)}
                    getData={getGalleries}
                  />
                  <div className="flex gap-2">
                    {filteredImages.length < 8 && (
                      <button
                        onClick={() => setAddGalleryImages(gallery)}
                        className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
                      >
                        Add Image
                      </button>
                    )}
                    {filteredImages.length > 0 && (
                      <button
                        onClick={() => setRemoveGalleryImages(gallery)}
                        className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-orange-text)] bg-[var(--yp-orange-bg)]"
                      >
                        Remove Images
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteGallery(gallery.uniqueId)}
                      className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
                    >
                      Delete Gallery
                    </button>
                  </div>
                </div>

                {/* Gallery Grid */}
                {filteredImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredImages.map((img: string, idx: number) => {
                      const fullUrl = `${
                        import.meta.env.VITE_MEDIA_URL
                      }/${img}`;
                      return (
                        <div
                          key={idx}
                          className="relative rounded-xl overflow-hidden shadow hover:shadow-lg cursor-pointer"
                          onClick={() => {
                            setLightboxIndex(idx);
                            setActiveGalleryIndex(gIdx);
                            setOpenLightbox(true);
                          }}
                        >
                          <img
                            src={fullUrl}
                            alt={`gallery-${gIdx}-img-${idx}`}
                            className="w-full h-48 object-cover bg-[var(--yp-tertiary)]"
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-[var(--yp-muted)]">
                    No images available in this gallery.
                  </div>
                )}
              </div>
            );
          })}

          {/* Lightbox */}
          {activeGalleryIndex !== null && (
            <Lightbox
              open={openLightbox}
              close={() => setOpenLightbox(false)}
              index={lightboxIndex}
              slides={getSlides(galleries[activeGalleryIndex]?.gallery || [])}
              plugins={[Thumbnails, Zoom, Fullscreen, Slideshow, Counter]}
              zoom={{ maxZoomPixelRatio: 10, scrollToZoom: true }}
            />
          )}
        </div>
      )}

      <AddGallery property={property} getGalleries={getGalleries} />
    </div>
  );
}
