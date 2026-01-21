import { daysOfWeek } from "@/common/ExtraData";
import {
  PropertyProps,
  PropertyWorkingHoursProps,
} from "@/types/PropertyTypes";
import { formatTo12Hour } from "@/context/Callbacks";
import { LuCircleCheck, LuCircleX } from "react-icons/lu";

export default function WorkingHours({
  property,
}: {
  property: PropertyProps | null;
}) {
  const schedules: PropertyWorkingHoursProps[] = daysOfWeek.map((day) => {
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

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="flex justify-center items-center bg-(--primary-bg) text-(--text-color)">
      <div className="w-full">
        <ul>
          {schedules.map((item, index) => {
            const isToday = item.day?.toLowerCase() === today.toLowerCase();

            const isClosed =
              !item.isOpen ||
              !item.openTime ||
              !item.closeTime ||
              item.openTime.trim() === "" ||
              item.closeTime.trim() === "";

            const finalTime = isClosed
              ? "Closed"
              : `${formatTo12Hour(item.openTime)} - ${formatTo12Hour(
                  item.closeTime
                )}`;

            return (
              <li
                key={index}
                className={`flex justify-between items-center px-5 py-3 transition-colors duration-300 group ${
                  isToday
                    ? "bg-(--main-emphasis) text-(--main-light) font-semibold"
                    : "hover:bg-(--main-light) hover:text-(--main-emphasis)"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isClosed ? (
                    <LuCircleX
                      size={18}
                      className={` ${
                        isToday
                          ? "bg-(--danger) text-(--danger-subtle) rounded-full"
                          : "text-(--danger) group-hover:text-(--danger-subtle) group-hover:bg-(--danger) rounded-full"
                      }`}
                    />
                  ) : (
                    <LuCircleCheck
                      size={18}
                      className={` ${
                        isToday
                          ? "bg-(--success) text-(--success-subtle) rounded-full"
                          : "text-(--success) group-hover:text-(--success-subtle) group-hover:bg-(--success) rounded-full"
                      }`}
                    />
                  )}
                  <span className="font-medium heading-sm capitalize">{item.day}</span>
                </div>

                <span
                  className={`paragraph ${
                    isClosed
                      ? "text-(--danger) font-semibold"
                      : "hover:text-(--text-color-emphasis)"
                  }`}
                >
                  {finalTime}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
