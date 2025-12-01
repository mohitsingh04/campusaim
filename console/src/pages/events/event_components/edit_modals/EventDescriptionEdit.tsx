import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import JoditEditor from "jodit-react";
import { X } from "lucide-react";
import { EventsProps } from "../../../../types/types";
import { getEditorConfig } from "../../../../contexts/JoditEditorConfig";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import toast from "react-hot-toast";
import { API } from "../../../../contexts/API";
import { useParams } from "react-router-dom";

export default function EventDescriptionEditModal({
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
  const [mounted, setMounted] = useState(false);
  const editor = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [description, setDescription] = useState("");

  const editorConfig = useMemo(() => getEditorConfig(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (data) {
      setDescription(data.description || "");
    }
  }, [data]);

  if (!mounted || !isOpen) return null;

  const saveChanges = async () => {
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("description", description);

      const response = await API.patch(`/event/${objectId}`, formData);

      toast.success(response.data.message || "Event updated successfully!");
      onSave();
      onClose();
    } catch (err) {
      getErrorResponse(err);
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[var(--yp-primary)] rounded-xl shadow-lg p-6 relative max-h-[80vh] flex flex-col">
        {/* Close Btn */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--yp-text-secondary)]"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Heading */}
        <h2 className="text-xl font-semibold text-[var(--yp-text-primary)] mb-4">
          Edit Description
        </h2>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-2 flex-1">
          {/* Description Editor */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)]">
              Description
            </label>

            <JoditEditor
              ref={editor}
              value={description}
              config={editorConfig}
              onBlur={(value) => setDescription(value)}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--yp-border-primary)]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-[var(--yp-red-bg)] text-[var(--yp-red-text)]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={saveChanges}
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
