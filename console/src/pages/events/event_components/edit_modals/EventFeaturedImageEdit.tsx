import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { ImageInput } from "../../../../ui/inputs/ImageInput";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import { EventsProps } from "../../../../types/types";
import { useParams } from "react-router-dom";

export default function EventFeaturedImageEditModal({
  isOpen,
  onClose,
  data,
  onSave,
}: {
  isOpen: boolean;
  onClose: any;
  data: EventsProps;
  onSave: () => void;
}) {
  const { objectId } = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);

  useEffect(() => {
    if (data) setFeaturedImage(null);
  }, [data]);

  if (!isOpen) return null;

  const existingPreview = data?.featured_image?.[0]
    ? `${import.meta.env.VITE_MEDIA_URL}/events/${data.featured_image?.[0]}`
    : null;

  const newPreview = featuredImage ? URL.createObjectURL(featuredImage) : null;

  const finalPreview = newPreview || existingPreview;

  const saveChanges = async () => {
    if (!featuredImage) {
      toast.error("Select a featured image");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("featured_image", featuredImage);

      const response = await API.patch(`/event/${objectId}`, formData);

      toast.success(response.data.message || "Featured image updated");
      onSave();
      onClose();
    } catch (err) {
      getErrorResponse(err);
    } finally {
      setSubmitting(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[var(--yp-primary)] rounded-xl shadow-lg p-6 relative max-h-[80vh] flex flex-col overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--yp-text-secondary)]"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold text-[var(--yp-text-primary)] mb-4">
          Edit Featured Image
        </h2>

        <div className="overflow-y-auto flex-1 pr-2 space-y-4">
          {finalPreview && (
            <div className="w-full flex justify-center">
              <img
                src={finalPreview}
                alt="Preview"
                className="max-h-64 rounded-lg object-contain border border-[var(--yp-border-primary)]"
              />
            </div>
          )}

          <ImageInput
            name="featured_image"
            file={featuredImage}
            onChange={setFeaturedImage}
            label="Upload New Image"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--yp-border-primary)]">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-[var(--yp-red-bg)] text-[var(--yp-red-text)]"
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            onClick={saveChanges}
            className="px-6 py-2 rounded-lg bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
