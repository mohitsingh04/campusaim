import React from "react";
import CountUp from "react-countup";
import { FaChartLine } from "react-icons/fa";
import { PiChartLineDownBold } from "react-icons/pi";

interface MetricCardProps {
  title: string;
  value: number;
  changeText?: string;
  changeType?: "up" | "down";
  barColor?: string;
  icon?: React.ElementType;
  duration?: number;
}

export default function MetricCard({
  title,
  value,
  changeText,
  changeType = "down",
  barColor = "text-red-500",
  icon: Icon,
  duration = 2,
}: MetricCardProps) {
  const isNumeric = typeof value === "number";

  return (
    <div className="relative bg-[var(--yp-primary)] rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div
            className={`w-1 h-4 rounded-full ${barColor.replace("text", "bg")}`}
          />
          <h3 className="text-sm font-medium text-[var(--yp-text-secondary)]">
            {title}
          </h3>
        </div>
        {Icon && <Icon className={`w-6 h-6 ${barColor}`} />}
      </div>

      <p className="text-3xl font-extrabold text-[var(--yp-text-primary)] mt-2">
        {isNumeric ? <CountUp end={value} duration={duration} /> : value}
      </p>

      {changeText && (
        <div className="flex items-center gap-1 mt-2 text-sm font-medium">
          {changeType === "down" ? (
            <PiChartLineDownBold className="w-4 h-4 text-red-500" />
          ) : (
            <FaChartLine className="w-4 h-4 text-green-500" />
          )}
          <span
            className={
              changeType === "down" ? "text-red-500" : "text-green-500"
            }
          >
            {changeText}
          </span>
        </div>
      )}
    </div>
  );
}
