import { useState } from "react";
import toast from "react-hot-toast";

interface EventOtherDetailsProps {
  defaultData: any;
  onNext: (values: any) => void;
  onBack: () => void;
  handleFinalSubmit: () => void;
  submitting: boolean;
}

export default function EventOtherDetails({
  defaultData,
  onNext,
  onBack,
  handleFinalSubmit,
  submitting,
}: EventOtherDetailsProps) {
  const [ticketStart, setTicketStart] = useState(
    defaultData?.ticket_booking_start || ""
  );
  const [ticketEnd, setTicketEnd] = useState(
    defaultData?.ticket_booking_end || ""
  );

  // AGE LIMIT UPDATED TO OBJECT (min/max)
  const [ageLimit, setAgeLimit] = useState(
    defaultData?.age_limit || { min: "", max: "" }
  );

  const handleNext = async () => {
    // Validation: Ticket booking date check
    if (ticketStart && ticketEnd && ticketEnd < ticketStart) {
      toast.error("Ticket booking end date must be after start date.");
      return;
    }

    // Validation: Age limit check
    if (
      ageLimit.min &&
      ageLimit.max &&
      Number(ageLimit.max) < Number(ageLimit.min)
    ) {
      toast.error("Maximum age must be greater than minimum age.");
      return;
    }

    await onNext({
      ticket_booking_start: ticketStart,
      ticket_booking_end: ticketEnd,
      age_limit: {
        min: ageLimit.min || null,
        max: ageLimit.max || null,
      },
    });

    handleFinalSubmit();
  };

  return (
    <div className="space-y-8">
      {/* Ticket Booking Start / End */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Ticket Booking Start
          </label>
          <input
            type="date"
            value={ticketStart}
            onChange={(e) => setTicketStart(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)]
              rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Ticket Booking End
          </label>
          <input
            type="date"
            value={ticketEnd}
            onChange={(e) => setTicketEnd(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)]
              rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          />
        </div>
      </div>

      {/* Age Limit - MIN / MAX */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Minimum Age */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Minimum Age
          </label>
          <input
            type="number"
            value={ageLimit.min}
            onChange={(e) =>
              setAgeLimit({ ...ageLimit, min: e.target.value })
            }
            placeholder="Minimum Age"
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)]
              rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          />
        </div>

        {/* Maximum Age */}
        <div>
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Maximum Age
          </label>
          <input
            type="number"
            value={ageLimit.max}
            onChange={(e) =>
              setAgeLimit({ ...ageLimit, max: e.target.value })
            }
            placeholder="Maximum Age"
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)]
              rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-gray-text)] bg-[var(--yp-gray-bg)]"
        >
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={submitting}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
