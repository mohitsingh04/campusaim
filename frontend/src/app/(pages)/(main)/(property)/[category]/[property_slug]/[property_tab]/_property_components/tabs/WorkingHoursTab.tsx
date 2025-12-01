import { formatTo12Hour } from "@/contexts/Callbacks";
import { PropertyProps, WorkingHoursProps } from "@/types/types";
import React from "react";
import { LuCircleCheck } from "react-icons/lu";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const WorkingHoursTab = ({ property }: { property: PropertyProps | null }) => {
  const schedules: WorkingHoursProps[] = daysOfWeek.map((day) => {
    const found = property?.working_hours?.find((s) => s.day === day);
    return (
      found || {
        day,
        openTime: "",
        closeTime: "",
        isOpen: false,
      }
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-xs overflow-hidden">
        <div className="divide-y divide-gray-200">
          {schedules.map((schedule) => (
            <div
              key={schedule.day}
              className="p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-900 min-w-[110px] text-left">
                  {schedule.day}
                </span>

                {schedule.isOpen ? (
                  <LuCircleCheck className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="relative flex items-center justify-center">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                    <div className="relative w-5 h-5 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-right">
                {schedule.isOpen ? (
                  <div className="text-gray-700">
                    <span className="font-medium">
                      {formatTo12Hour(schedule.openTime)}
                    </span>
                    <span className="mx-2">-</span>
                    <span className="font-medium">
                      {formatTo12Hour(schedule.closeTime)}
                    </span>
                  </div>
                ) : (
                  <span className="text-red-600 font-medium">Closed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkingHoursTab;
