import React from "react";
import { API } from "../../../../contexts/API";
import { PropertyProps } from "../../../../types/types";
import toast from "react-hot-toast";
import { getErrorResponse } from "../../../../contexts/Callbacks";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface Props {
  property: PropertyProps | null;
  workingHours: Record<string, { open: string; close: string }>;
  checkboxes: Record<string, boolean>;
  setWorkingHours: React.Dispatch<
    React.SetStateAction<Record<string, { open: string; close: string }>>
  >;
  setCheckboxes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onCancel: () => void;
  onSave: () => void;
  hasData: boolean;
}

export default function WorkingHoursForm({
  property,
  workingHours,
  checkboxes,
  setWorkingHours,
  setCheckboxes,
  onCancel,
  onSave,
  hasData,
}: Props) {
  const handleTimeChange = (
    day: string,
    field: "open" | "close",
    value: string
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
    if (value !== "") setCheckboxes((prev) => ({ ...prev, [day]: true }));
  };

  const handleCopyDay = (day: string, checked: boolean) => {
    setCheckboxes((prev) => ({ ...prev, [day]: checked }));
    setWorkingHours((prev) => ({
      ...prev,
      [day]: checked ? { ...prev["Monday"] } : { open: "", close: "" },
    }));
  };

  const handleSelectAll = () => {
    const mondayTimes = workingHours["Monday"];
    setWorkingHours((prev) => {
      const updated = { ...prev };
      days.forEach((day) => {
        if (day !== "Sunday") updated[day] = { ...mondayTimes };
      });
      return updated;
    });
    setCheckboxes((prev) => {
      const updated = { ...prev };
      days.forEach((day) => {
        if (day !== "Sunday") updated[day] = true;
      });
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // normalize keys to lowercase for backend
      const payload = Object.fromEntries(
        Object.entries(workingHours).map(([day, value]) => [
          day.toLowerCase(),
          value,
        ])
      );

      if (hasData && property?.uniqueId) {
        // PATCH existing
        const response = await API.patch(
          `/business-hours/${property.uniqueId}`,
          payload
        );
        toast.success(
          response.data.message || "Working Hours Updated Successfully"
        );
      } else {
        // POST new
        const response = await API.post("/business-hours", {
          property_id: property?.uniqueId,
          ...payload,
        });
        toast.success(
          response.data.message || "Working Hours Added Successfully"
        );
      }
      onSave();
    } catch (error) {
      getErrorResponse(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <div className="flex justify-between">
        <div className="text-sm text-[var(--yp-red-text)] bg-[var(--yp-red-bg)] p-1 rounded content-center">
          If no opening and closing times are provided for a day, it will be
          considered closed.
        </div>
        <button
          type="button"
          onClick={handleSelectAll}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
        >
          Copy Monday → Saturday
        </button>
      </div>

      <div className="grid gap-3">
        {days.map((day) => (
          <div
            key={day}
            className="grid grid-cols-12 items-center justify-center gap-3"
          >
            <label className="col-span-3 font-medium text-[var(--yp-text-primary)]">
              {day}
            </label>
            <input
              type="checkbox"
              checked={checkboxes[day]}
              onChange={(e) => handleCopyDay(day, e.target.checked)}
              className="col-span-1 w-5 h-5 "
            />
            <input
              type="time"
              value={workingHours[day].open}
              onChange={(e) => handleTimeChange(day, "open", e.target.value)}
              className="col-span-4 border rounded-lg p-2 bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)] border-[var(--yp-border-primary)]"
            />
            <input
              type="time"
              value={workingHours[day].close}
              onChange={(e) => handleTimeChange(day, "close", e.target.value)}
              className="col-span-4 border rounded-lg p-2 bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)] border-[var(--yp-border-primary)]"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-5 border-t border-[var(--yp-border-primary)]">
        <button
          type="submit"
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
