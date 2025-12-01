import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { SimpleTable, Column } from "../../../../ui/tables/SimpleTable";
import { EventsProps } from "../../../../types/types";
import {
  formatDateWithoutTime,
  getErrorResponse,
  to12Hour,
} from "../../../../contexts/Callbacks";
import { API } from "../../../../contexts/API";
import { useParams } from "react-router-dom";

interface ScheduleItem {
  date: string;
  start_time: string;
  end_time: string;
}

export default function EventScheduleEditModal({
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
  const [submitting, setSubmitting] = useState(false);
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>([]);
  const [form, setForm] = useState<ScheduleItem>({
    date: "",
    start_time: "",
    end_time: "",
  });

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load existing schedule
  useEffect(() => {
    setScheduleList(data?.schedule || []);
  }, [data]);

  if (!mounted || !isOpen) return null;

  const updateField = (key: keyof ScheduleItem, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const addSchedule = () => {
    if (!form.date) return toast.error("Date is required");

    if (form.start_time && !form.end_time)
      return toast.error("End time is required");

    if (!form.start_time && form.end_time)
      return toast.error("Start time is required");

    if (form.start_time && form.end_time) {
      if (form.end_time <= form.start_time)
        return toast.error("End time must be later than start time");
    }

    setScheduleList([...scheduleList, form]);

    setForm({ date: "", start_time: "", end_time: "" });

    toast.success("Schedule added");
  };

  const removeSchedule = (idx: number) => {
    setScheduleList(scheduleList.filter((_, i) => i !== idx));
    toast.success("Schedule removed");
  };

  const saveChanges = async () => {
    if (scheduleList.length === 0)
      return toast.error("Add at least one schedule");
    if (!scheduleList?.[0]?.date) {
      toast.error(`Please Add Schedule Date`);
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("schedule", JSON.stringify(scheduleList || []));

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

  const columns: Column<ScheduleItem>[] = [
    { label: "Date", value: (row) => formatDateWithoutTime(row.date) || "-" },
    { label: "Start Time", value: (row) => to12Hour(row.start_time) || "-" },
    { label: "End Time", value: (row) => to12Hour(row.end_time) || "-" },
    {
      label: "Actions",
      value: (row) => {
        const idx = scheduleList.indexOf(row);

        return (
          <button
            type="button"
            onClick={() => removeSchedule(idx)}
            className="p-2 rounded-lg text-sm flex items-center justify-center font-medium 
                       text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
          >
            <X size={16} />
          </button>
        );
      },
    },
  ];

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[var(--yp-primary)] rounded-xl shadow-lg p-6 relative">
        <h2 className="text-xl font-semibold text-[var(--yp-text-primary)] mb-4">
          Edit Schedule
        </h2>

        {/* Add Schedule Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-[var(--yp-tertiary)] rounded-lg">
          <input
            type="date"
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] 
                       rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          />

          <input
            type="time"
            value={form.start_time}
            onChange={(e) => updateField("start_time", e.target.value)}
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] 
                       rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          />

          <input
            type="time"
            value={form.end_time}
            onChange={(e) => updateField("end_time", e.target.value)}
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] 
                       rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
          />

          <button
            type="button"
            onClick={addSchedule}
            className="px-6 py-2 rounded-lg text-sm flex items-center justify-center 
                       font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Schedule Table */}
        <div className="my-6">
          <SimpleTable data={scheduleList} columns={columns} />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-[var(--yp-red-bg)] 
                       text-[var(--yp-red-text)]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={saveChanges}
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-[var(--yp-blue-bg)] 
                       text-[var(--yp-blue-text)]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
