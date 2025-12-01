import { useCallback, useEffect, useState } from "react";
import { MessageSquare, MoreHorizontal, Check } from "lucide-react";
import { API } from "../../../contexts/API";
import { PropertyProps } from "../../../types/types";
import { getErrorResponse } from "../../../contexts/Callbacks";
import Skeleton from "react-loading-skeleton";

interface DayEntry {
  day: string;
  enquiries: number;
}

interface EnquiryDoc {
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

export default function EnquiryCounterCard({
  currentProperty,
}: {
  currentProperty: PropertyProps | null;
}) {
  const [enquiryStats, setEnquiryStats] = useState({
    current: 0,
    changePercent: null as number | null,
    currentMonthName: "",
  });
  const [filter, setFilter] = useState<FilterKey>("last7");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const getEnquiry = useCallback(async () => {
    setLoading(true);
    try {
      if (!currentProperty) return;

      const response = await API.get<EnquiryDoc[]>(
        `/property/enquiry/count/${currentProperty._id}`
      );
      const data = response.data;

      const now = new Date();
      const currentMonthIndex = now.getMonth();
      const currentMonthKey = monthKeys[currentMonthIndex];
      const currentMonthName = monthNames[currentMonthKey];

      let currentEnquiries = 0;
      let previousEnquiries = 0;

      data.forEach((doc: EnquiryDoc) => {
        doc.daily.forEach((dayEntry: DayEntry) => {
          const day = parseInt(dayEntry.day, 10);
          const enquiries = dayEntry.enquiries;
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
              if (diffInDays === 0) currentEnquiries += enquiries;
              if (diffInDays === 1) previousEnquiries += enquiries;
              break;
            case "last7":
              if (diffInDays >= 0 && diffInDays < 7)
                currentEnquiries += enquiries;
              if (diffInDays >= 7 && diffInDays < 14)
                previousEnquiries += enquiries;
              break;
            case "last30":
              if (diffInDays >= 0 && diffInDays < 30)
                currentEnquiries += enquiries;
              if (diffInDays >= 30 && diffInDays < 60)
                previousEnquiries += enquiries;
              break;
            case "6months":
              if (diffInMonths >= 0 && diffInMonths < 6)
                currentEnquiries += enquiries;
              if (diffInMonths >= 6 && diffInMonths < 12)
                previousEnquiries += enquiries;
              break;
            case "1year":
              if (diffInMonths >= 0 && diffInMonths < 12)
                currentEnquiries += enquiries;
              if (diffInMonths >= 12 && diffInMonths < 24)
                previousEnquiries += enquiries;
              break;
            case "all":
            default:
              currentEnquiries += enquiries;
              previousEnquiries = 0;
              break;
          }
        });
      });

      const changePercent =
        previousEnquiries > 0
          ? ((currentEnquiries - previousEnquiries) / previousEnquiries) * 100
          : null;

      setEnquiryStats({
        current: currentEnquiries,
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
    getEnquiry();
  }, [getEnquiry]);

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
          <div className="w-1 h-4 rounded-full bg-red-500" />
          <h3 className="text-sm font-medium text-[var(--yp-text-secondary)]">
            Enquiries
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
        {enquiryStats.current}
      </p>

      {/* Change Row */}
      {enquiryStats.changePercent !== null ? (
        <div
          className={`flex items-center gap-1 mt-2 text-sm font-medium ${
            enquiryStats.changePercent >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {enquiryStats.changePercent >= 0 ? (
            <MessageSquare className="w-4 h-4" />
          ) : (
            <MessageSquare className="w-4 h-4" />
          )}
          <span>
            {enquiryStats.changePercent >= 0 ? "+" : ""}
            {enquiryStats.changePercent.toFixed(1)}% vs previous period
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
