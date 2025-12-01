import { useEffect, useState, useCallback } from "react";
import { Edit2 } from "lucide-react";
import { API } from "../../../../contexts/API";
import WorkingHoursForm from "./AddWorkingHours";
import { Column, SimpleTable } from "../../../../ui/tables/SimpleTable";
import { formatToAmPm, getErrorResponse } from "../../../../contexts/Callbacks";
import { PropertyProps } from "../../../../types/types";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function WorkingHours({
  property,
}: {
  property: PropertyProps | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [workingHours, setWorkingHours] = useState<
    Record<string, { open: string; close: string }>
  >(
    days.reduce((acc, day) => {
      acc[day] = { open: "", close: "" };
      return acc;
    }, {} as Record<string, { open: string; close: string }>)
  );
  const [checkboxes, setCheckboxes] = useState<Record<string, boolean>>(
    days.reduce((acc, day) => {
      acc[day] = false;
      return acc;
    }, {} as Record<string, boolean>)
  );
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  const fetchWorkingHours = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/business-hours/${property?.uniqueId}`);
      if (res.data && Object.keys(res.data).length) {
        const normalized: Record<string, { open: string; close: string }> = {};
        days.forEach((day) => {
          const key = day.toLowerCase();
          normalized[day] = res.data[key] || { open: "", close: "" };
        });
        setWorkingHours(normalized);
        setHasData(true);
      } else {
        setHasData(false);
      }
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [property?.uniqueId]);

  useEffect(() => {
    if (property?.uniqueId) fetchWorkingHours();
  }, [property?.uniqueId, fetchWorkingHours]);

  if (loading) return <p className="p-4">Loading...</p>;

  const tableData = days.map((day) => ({
    day,
    open: formatToAmPm(workingHours[day]?.open) || "Closed",
    close: formatToAmPm(workingHours[day]?.close) || "Closed",
  }));

  const columns: Column<(typeof tableData)[0]>[] = [
    { label: "Day", value: "day" },
    { label: "Opening Time", value: "open" },
    { label: "Closing Time", value: "close" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center border-b border-[var(--yp-border-primary)] p-4">
        <h2 className="text-2xl font-extrabold text-[var(--yp-text-primary)] flex items-center gap-2">
          Working Hours
        </h2>

        {hasData && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)] flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {(!hasData || isEditing) && property?.uniqueId ? (
        <WorkingHoursForm
          workingHours={workingHours}
          property={property}
          setWorkingHours={setWorkingHours}
          checkboxes={checkboxes}
          setCheckboxes={setCheckboxes}
          hasData={hasData}
          onCancel={() => setIsEditing(false)}
          onSave={async () => {
            setIsEditing(false);
            await fetchWorkingHours();
          }}
        />
      ) : (
        <div className="p-4">
          <SimpleTable data={tableData} columns={columns} />
        </div>
      )}
    </div>
  );
}
