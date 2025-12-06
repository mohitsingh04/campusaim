import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { API } from "../../../../contexts/API";
import { PropertyProps } from "../../../../types/types";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import Swal from "sweetalert2";

interface Gallery {
  _id: string;
  title: string;
  gallery: string[];
}

export default function RemoveGalleryImages({
  gallery,
  getGalleries,
  setRemoveGalleryImages,
}: {
  gallery: Gallery;
  property: PropertyProps | null;
  getGalleries: () => void;
  setRemoveGalleryImages: (value: any | null) => void;
}) {
  const webpFilenames =
    gallery?.gallery?.filter((img) => img.toLowerCase().endsWith(".webp")) ||
    [];

  useEffect(() => {
    if (gallery?.gallery?.length <= 0) {
      setRemoveGalleryImages(null);
    }
  }, [gallery, setRemoveGalleryImages]);

  const handleImageRemove = async (img: string) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This image will be removed permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, remove it",
      });

      if (!result.isConfirmed) return;

      const data = {
        galleryId: gallery._id,
        webpPaths: [img],
      };

      const response = await API.post(
        `/gallery/remove/${gallery?._id}`,
        data
      );

      setRemoveGalleryImages(response.data.data);
      getGalleries();
      toast.success(response.data.message || "Image removed.");
    } catch (error) {
      getErrorResponse(error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-[var(--yp-border-primary)] pb-3">
        <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
          Remove Images from “{gallery.title}”
        </h2>
        <button
          onClick={() => setRemoveGalleryImages(null)}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
        >
          Cancel
        </button>
      </div>

      {/* Images Grid */}
      {webpFilenames.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {webpFilenames.map((img, index) => (
            <div
              key={index}
              className="relative rounded-xl overflow-hidden shadow-md bg-[var(--yp-tertiary)] group hover:shadow-lg hover:scale-[1.02] transition-transform"
            >
              <img
                src={`${import.meta.env.VITE_MEDIA_URL}/${img}`}
                alt={`gallery-${index}`}
                className="w-full h-48 object-cover"
              />
              {/* Hover Remove Button */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageRemove(img);
                  }}
                  className="p-3 rounded-full bg-[var(--yp-red-bg)] hover:bg-[var(--yp-red-text)] text-[var(--yp-red-text)] hover:text-[var(--yp-red-bg)]  shadow-md transition"
                  title="Remove"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Trash2 className="w-10 h-10 text-[var(--yp-muted)] mb-2" />
          <p className="text-[var(--yp-muted)] text-sm">
            No images available to remove in this gallery.
          </p>
        </div>
      )}
    </div>
  );
}
