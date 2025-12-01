import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { ImageInput } from "../../../../ui/inputs/ImageInput";
import toast from "react-hot-toast";
import { API } from "../../../../contexts/API";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import { useParams } from "react-router-dom";
import { EventsProps } from "../../../../types/types";

export default function EventHostEditModal({
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

  const [hostName, setHostName] = useState("");
  const [hostImage, setHostImage] = useState<File | null>(null);

  const existingHostImage = data?.host?.image?.[0]
    ? `${import.meta.env.VITE_MEDIA_URL}/events/${data.host.image[0]}`
    : null;

  useEffect(() => {
    if (!data) return;

    setHostName(data?.host?.name || "");
    setHostImage(null);
  }, [data]);

  if (!isOpen) return null;

  const saveChanges = async () => {
    const hostNameGiven = hostName.trim() !== "";
    const hostImageGiven = !!hostImage;

    if (hostNameGiven && !hostImageGiven && !existingHostImage)
      return toast.error("Host image is required when host name is provided");

    if (!hostNameGiven && hostImageGiven)
      return toast.error("Host name is required when host image is provided");

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("host_name", hostName || "");

      if (hostImage) fd.append("host_image", hostImage);

      const response = await API.patch(`/event/${objectId}`, fd);

      toast.success(response.data.message || "Host updated successfully");
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
      <div className="w-full max-w-lg bg-[var(--yp-primary)] rounded-xl shadow-lg p-6 relative max-h-[80vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--yp-text-secondary)]"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold text-[var(--yp-text-primary)] mb-4">
          Edit Host
        </h2>

        <div className="overflow-y-auto flex-1 pr-2 space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-medium text-[var(--yp-text-secondary)]">
              Host Name
            </label>

            <input
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Enter Host Name"
              className="w-full px-3 py-2 border rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />

            {existingHostImage && !hostImage && (
              <img
                src={existingHostImage}
                className="w-28 h-28 rounded-full object-cover border border-[var(--yp-border-primary)]"
              />
            )}

            <ImageInput
              name="host_image"
              file={hostImage}
              onChange={setHostImage}
              label="Host Image"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--yp-border-primary)]">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-[var(--yp-red-bg)] text-[var(--yp-red-text)]"
          >
            Cancel
          </button>

          <button
            onClick={saveChanges}
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
