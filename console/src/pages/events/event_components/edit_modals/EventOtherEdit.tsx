import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { EventsProps } from "../../../../types/types";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import { API } from "../../../../contexts/API";
import { useParams } from "react-router-dom";

export default function EventOtherDetailsEditModal({
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
  const [mounted, setMounted] = useState(false);
  const { objectId } = useParams();

  const [ticketStart, setTicketStart] = useState("");
  const [ticketEnd, setTicketEnd] = useState("");

  // AGE LIMIT NOW AS OBJECT (min/max)
  const [ageLimit, setAgeLimit] = useState({ min: "", max: "" });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (data) {
      setTicketStart(formatDate(data.ticket_booking?.start));
      setTicketEnd(formatDate(data.ticket_booking?.end));

      setAgeLimit({
        min: data.age_limit?.min || "",
        max: data.age_limit?.max || "",
      });
    }
  }, [data]);

  if (!mounted || !isOpen) return null;

  function formatDate(value: string) {
    if (!value) return "";
    return new Date(value).toISOString().split("T")[0];
  }

  const handleSave = async () => {
    if (ticketStart && ticketEnd && ticketEnd < ticketStart) {
      toast.error("End date must be after start date");
      return;
    }

    if (
      ageLimit.min &&
      ageLimit.max &&
      Number(ageLimit.max) < Number(ageLimit.min)
    ) {
      toast.error("Maximum age must be greater than minimum age");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append(
        "ticket_booking",
        JSON.stringify({
          start: ticketStart || "",
          end: ticketEnd || "",
        })
      );

      formData.append(
        "age_limit",
        JSON.stringify({
          min: ageLimit.min || null,
          max: ageLimit.max || null,
        })
      );

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        className="
          w-full max-w-xl 
          bg-[var(--yp-primary)]
          rounded-xl 
          shadow-lg 
          p-6 
          relative 
          max-h-[80vh]
          flex flex-col
        "
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--yp-text-secondary)]"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-[var(--yp-text-primary)] mb-4">
          Edit Ticketing & Age Details
        </h2>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-2 flex-1 space-y-6">
          {/* Ticket Date Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-[var(--yp-text-secondary)] mb-2">
                Ticket Booking Start
              </label>
              <input
                type="date"
                value={ticketStart}
                onChange={(e) => setTicketStart(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg 
                           border-[var(--yp-border-primary)]
                           bg-[var(--yp-input-primary)]
                           text-[var(--yp-text-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--yp-text-secondary)] mb-2">
                Ticket Booking End
              </label>
              <input
                type="date"
                value={ticketEnd}
                onChange={(e) => setTicketEnd(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg 
                           border-[var(--yp-border-primary)]
                           bg-[var(--yp-input-primary)]
                           text-[var(--yp-text-primary)]"
              />
            </div>
          </div>

          {/* Age Limit */}
          <div>
            <label className="block text-sm text-[var(--yp-text-secondary)] mb-2">
              Age Limit
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="number"
                value={ageLimit.min}
                placeholder="Minimum Age"
                onChange={(e) =>
                  setAgeLimit({ ...ageLimit, min: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg 
                           border-[var(--yp-border-primary)]
                           bg-[var(--yp-input-primary)]
                           text-[var(--yp-text-primary)]"
              />

              <input
                type="number"
                value={ageLimit.max}
                placeholder="Maximum Age"
                onChange={(e) =>
                  setAgeLimit({ ...ageLimit, max: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg 
                           border-[var(--yp-border-primary)]
                           bg-[var(--yp-input-primary)]
                           text-[var(--yp-text-primary)]"
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--yp-border-primary)]">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-[var(--yp-red-bg)] text-[var(--yp-red-text)]"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
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
