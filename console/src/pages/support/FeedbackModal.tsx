import { useState } from "react";
import { FeedbackData } from "../../common/FeedbackData";
import { API } from "../../contexts/API";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | undefined;
  supportUserId: number | string | undefined;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  userId,
  supportUserId,
}: FeedbackModalProps) {
  const { objectId } = useParams();
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (selected === null) {
      toast.error("Please select a reaction before submitting.");
      return;
    }
    try {
      setSubmitting(true);

      const payload = {
        feedback: FeedbackData[selected].label,
        userId: userId,
        supportId: objectId,
        supportUserId: supportUserId,
      };

      const response = await API.post("/feedback/support/give", payload);
      toast.success(response.data.message || "Thank you for your feedback!");
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to submit feedback"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return <></>;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-[var(--yp-primary)] shadow-md hover:shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-lg">
        {/* Heading */}
        <h2 className="text-[var(--yp-text-primary)] font-bold text-xl mb-2">
          Support Chat Closed
        </h2>
        <p className="text-[var(--yp-muted)] text-sm mb-6">
          How was your experience with this support conversation?
        </p>

        {/* Rating Faces */}
        <div className="flex justify-between gap-3 mb-4">
          {FeedbackData.map((item, idx) => {
            const Icon = item.icon;
            const isActive = selected === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelected(idx)}
                className={`flex flex-col items-center justify-center rounded-xl transition p-2 hover:scale-105 ${
                  isActive
                    ? `${item.bg} opacity-100 scale-110`
                    : `opacity-55 ${item.bg}`
                }`}
              >
                <Icon className={`${item.color} w-16 h-16`} />
              </button>
            );
          })}
        </div>

        {/* Selected label */}
        {selected !== null && (
          <p className={`text-center text-base font-medium text-[var(--yp-text-secondary)] mb-6`}>
            {FeedbackData[selected].label}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-[var(--yp-tertiary)] text-[var(--yp-text-secondary)] hover:opacity-80 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-[var(--yp-main)] text-white font-medium hover:opacity-80 transition shadow-md"
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}
