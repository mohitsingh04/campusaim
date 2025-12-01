import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { API } from "../../../../contexts/API";
import { PropertyProps } from "../../../../types/types";
import { getErrorResponse } from "../../../../contexts/Callbacks";

export default function RemoveCertifications({
  certifications,
  property,
  getCertifications,
  setMode,
}: {
  certifications: { certifications: string[] };
  property: PropertyProps | null;
  getCertifications: () => void;
  setMode: (mode: "view" | "add" | "remove") => void;
}) {
  const webpFilenames =
    certifications?.certifications?.filter((img) =>
      img.toLowerCase().endsWith(".webp")
    ) || [];

  useEffect(() => {
    if (certifications?.certifications?.length <= 0) {
      setMode("view");
    }
  }, [certifications, setMode]);

  const handleImageRemove = async (img: string) => {
    try {
      const data = { webpPaths: [img] };
      const response = await API.post(
        `/certifications/remove/${property?.uniqueId}`,
        data
      );
      getCertifications();
      toast.success(response.data.message || "Certification removed.");
    } catch (error) {
      getErrorResponse(error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
          Remove Certifications
        </h2>
        <button
          onClick={() => setMode("view")}
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
                src={`${import.meta.env.VITE_MEDIA_URL}${img}`}
                alt={`certification-${index}`}
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
            No certifications available to remove.
          </p>
        </div>
      )}
    </div>
  );
}
