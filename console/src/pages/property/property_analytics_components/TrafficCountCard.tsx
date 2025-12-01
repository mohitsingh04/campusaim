import { useCallback, useEffect, useState } from "react";
import {
  MoreHorizontal,
  ArrowDownRight,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { API } from "../../../contexts/API";
import { PropertyProps } from "../../../types/types";
import { getErrorResponse } from "../../../contexts/Callbacks";
import Skeleton from "react-loading-skeleton";

interface DayEntry {
  day: string;
  clicks: number;
}

interface TrafficDoc {
  month: string;
  year: number;
  daily: DayEntry[];
}

const monthNames: Record<
  | "jan"
  | "feb"
  | "mar"
  | "apr"
  | "may"
  | "jun"
  | "jul"
  | "aug"
  | "sep"
  | "oct"
  | "nov"
  | "dec",
  string
> = {
  jan: "January",
  feb: "February",
  mar: "March",
  apr: "April",
  may: "May",
  jun: "June",
  jul: "July",
  aug: "August",
  sep: "September",
  oct: "October",
  nov: "November",
  dec: "December",
};

const monthKeys = Object.keys(monthNames) as Array<keyof typeof monthNames>;

const filterOptions = [
  { key: "today", label: "Today" },
  { key: "last7", label: "Last 7 Days" },
  { key: "last30", label: "Last 30 Days" },
  { key: "6months", label: "Last 6 Months" },
  { key: "1year", label: "Last 1 Year" },
  { key: "all", label: "All Time" },
] as const;

type FilterKey = (typeof filterOptions)[number]["key"];

export default function TrafficCounterCard({
  currentProperty,
}: {
  currentProperty: PropertyProps | null;
}) {
  const [trafficStats, setTrafficStats] = useState({
    current: 0,
    changePercent: null as number | null,
    currentMonthName: "",
  });
  const [filter, setFilter] = useState<FilterKey>("last7");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const getTraffic = useCallback(async () => {
    setLoading(true);
    try {
      if (!currentProperty) return;

      const response = await API.get<TrafficDoc[]>(
        `/property/traffic/${currentProperty._id}`
      );
      const data = response.data;

      const now = new Date();
      const currentMonthIndex = now.getMonth();
      const currentMonthKey = monthKeys[currentMonthIndex];
      const currentMonthName = monthNames[currentMonthKey];

      let currentClicks = 0;
      let previousClicks = 0;

      data.forEach((doc: TrafficDoc) => {
        doc.daily.forEach((dayEntry: DayEntry) => {
          const day = parseInt(dayEntry.day, 10);
          const clicks = dayEntry.clicks;
          const entryDate: Date = new Date(`${doc.month} ${day}, ${doc.year}`);

          const diffInDays = Math.floor(
            (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          const diffInMonths =
            now.getMonth() -
            entryDate.getMonth() +
            12 * (now.getFullYear() - entryDate.getFullYear());

          switch (filter) {
            case "today":
              if (diffInDays === 0) currentClicks += clicks;
              if (diffInDays === 1) previousClicks += clicks;
              break;
            case "last7":
              if (diffInDays >= 0 && diffInDays < 7) currentClicks += clicks;
              if (diffInDays >= 7 && diffInDays < 14) previousClicks += clicks;
              break;
            case "last30":
              if (diffInDays >= 0 && diffInDays < 30) currentClicks += clicks;
              if (diffInDays >= 30 && diffInDays < 60) previousClicks += clicks;
              break;
            case "6months":
              if (diffInMonths >= 0 && diffInMonths < 6)
                currentClicks += clicks;
              if (diffInMonths >= 6 && diffInMonths < 12)
                previousClicks += clicks;
              break;
            case "1year":
              if (diffInMonths >= 0 && diffInMonths < 12)
                currentClicks += clicks;
              if (diffInMonths >= 12 && diffInMonths < 24)
                previousClicks += clicks;
              break;
            case "all":
            default:
              currentClicks += clicks;
              previousClicks = 0; // no previous data
              break;
          }
        });
      });

      const changePercent =
        previousClicks > 0
          ? ((currentClicks - previousClicks) / previousClicks) * 100
          : null;

      setTrafficStats({
        current: currentClicks,
        changePercent,
        currentMonthName,
      });
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [filter, currentProperty]);

  useEffect(() => {
    getTraffic();
  }, [getTraffic]);

  if (loading) {
    return (
      <div>
        <Skeleton height={150} />
      </div>
    );
  }

  return (
    <div className="relative bg-[var(--yp-primary)] rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col">
      {/* Top Row */}
      <div className="flex justify-between items-start relative">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-purple-500" />
          <h3 className="text-sm font-medium text-[var(--yp-text-secondary)]">
            Traffic
          </h3>
        </div>

        {/* Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="p-1 rounded-full hover:bg-[var(--yp-tertiary)]"
          >
            <MoreHorizontal className="w-5 h-5 text-[var(--yp-muted)]" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-36 bg-[var(--yp-tertiary)] rounded-lg shadow-lg z-20">
              {filterOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    setFilter(opt.key);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-[var(--yp-text-primary)]"
                >
                  {opt.label}
                  {filter === opt.key && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Value */}
      <p className="text-3xl font-extrabold text-[var(--yp-text-primary)] mt-2">
        {trafficStats.current}
      </p>

      {/* Change Row */}
      {trafficStats.changePercent !== null ? (
        <div
          className={`flex items-center gap-1 mt-2 text-sm font-medium ${
            trafficStats.changePercent >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {trafficStats.changePercent >= 0 ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          <span>
            {trafficStats.changePercent >= 0 ? "+" : ""}
            {trafficStats.changePercent.toFixed(1)}% vs previous period
          </span>
        </div>
      ) : (
        <div className="mt-2 text-sm text-[var(--yp-muted)]">
          No previous data for compare
        </div>
      )}
    </div>
  );
}
