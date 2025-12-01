import { useState } from "react";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { Column, SimpleTable } from "../../../ui/tables/SimpleTable";

interface EventScheduleProps {
  onNext: (values: any) => void;
  defaultData: any;
  onBack: () => void;
}

interface ScheduleItem {
  date: string;
  start_time: string;
  end_time: string;
}

export default function EventSchedule({
  onNext,
  defaultData,
  onBack,
}: EventScheduleProps) {
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>(
    defaultData?.schedule || []
  );

  const [form, setForm] = useState<ScheduleItem>({
    date: "",
    start_time: "",
    end_time: "",
  });

  const updateField = (key: keyof ScheduleItem, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const addSchedule = () => {
    if (!form.date) {
      toast.error("Date is required");
      return;
    }

    if (form.start_time && !form.end_time) {
      toast.error("End time is required when start time is provided");
      return;
    }

    if (!form.start_time && form.end_time) {
      toast.error("Start time is required when end time is provided");
      return;
    }

    if (form.start_time && form.end_time) {
      if (form.end_time <= form.start_time) {
        toast.error("End time must be later than start time");
        return;
      }
    }

    setScheduleList([...scheduleList, form]);

    // Reset form
    setForm({ date: "", start_time: "", end_time: "" });

    toast.success("Schedule added");
  };

  const removeSchedule = (idx: number) => {
    setScheduleList(scheduleList.filter((_, i) => i !== idx));
    toast.success("Schedule removed");
  };

  const handleNext = () => {
    if (scheduleList.length === 0) {
      toast.error("Add at least one schedule before proceeding");
      return;
    }

    onNext({ schedule: scheduleList });
  };

  const columns: Column<ScheduleItem>[] = [
    { label: "Date", value: "date" },
    { label: "Start Time", value: (row) => row.start_time || "-" },
    { label: "End Time", value: (row) => row.end_time || "-" },

    {
      label: "Actions",
      value: (row) => {
        const rowIndex = scheduleList.indexOf(row);

        return (
          <button
            type="button"
            onClick={() => removeSchedule(rowIndex)}
            className="p-2 rounded-lg text-sm flex items-center justify-center font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
          >
            <X size={16} />
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-[var(--yp-tertiary)] rounded-lg">
        <input
          type="date"
          value={form.date}
          onChange={(e) => updateField("date", e.target.value)}
          className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
        />

        <input
          type="time"
          value={form.start_time}
          onChange={(e) => updateField("start_time", e.target.value)}
          className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
        />

        <input
          type="time"
          value={form.end_time}
          onChange={(e) => updateField("end_time", e.target.value)}
          className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
        />

        <button
          type="button"
          onClick={addSchedule}
          className="px-6 py-2 rounded-lg text-sm flex items-center justify-center font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Table */}
      <SimpleTable data={scheduleList} columns={columns} />

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-lg text-sm flex items-center justify-center font-medium text-[var(--yp-gray-text)] bg-[var(--yp-gray-bg)]"
        >
          Back
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-2 rounded-lg text-sm flex items-center justify-center font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
