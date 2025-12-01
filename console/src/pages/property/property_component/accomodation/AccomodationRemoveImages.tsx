import { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { API } from "../../../../contexts/API";
import { getErrorResponse } from "../../../../contexts/Callbacks";

export default function AccomodationRemoveImages({
  accomodation,
  images,
  getAccomodation,
  setMode,
}: {
  accomodation: any;
  images: string[];
  getAccomodation: () => void;
  setMode: (mode: string) => void;
}) {
  const [localImages, setLocalImages] = useState<string[]>([]);

  useEffect(() => {
    if (!images || images.length === 0) {
      setMode("");
    } else {
      // Only allow webp
      setLocalImages(
        images.filter((img) => img.toLowerCase().endsWith(".webp"))
      );
    }
  }, [images, setMode]);

  const handleImageRemove = async (img: string) => {
    try {
      const data = { webpPaths: [img] };

      const response = await API.post(
        `/accomodation/images/remove/${accomodation?.uniqueId}`,
        data
      );

      // remove locally so UI updates instantly
      setLocalImages((prev) => prev.filter((i) => i !== img));

      // refresh from backend
      getAccomodation();

      toast.success(response.data.message || "Image removed successfully.");
    } catch (error) {
      getErrorResponse(error);
    }
  };

  useEffect(() => {
    if (images?.length <= 0) {
      setMode("");
    }
  }, [images, setMode]);

  if (localImages.length === 0) {
    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
            Remove Images
          </h2>
          <button
            onClick={() => setMode("")}
            className="px-1 py-1 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Trash2 className="w-10 h-10 text-[var(--yp-muted)] mb-2" />
          <p className="text-[var(--yp-muted)] text-sm">
            No images available to remove.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
          Remove Images
        </h2>
        <button
          onClick={() => setMode("")}
          className="px-1 py-1 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {localImages.map((img, index) => (
          <div
            key={index}
            className="relative rounded-xl overflow-hidden shadow-md bg-[var(--yp-tertiary)] group hover:shadow-lg hover:scale-[1.02] transition-transform"
          >
            <img
              src={`${import.meta.env.VITE_MEDIA_URL}/${img}`}
              alt={`accomodation-${index}`}
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
    </div>
  );
}
