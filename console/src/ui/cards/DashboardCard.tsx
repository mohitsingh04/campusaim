import React from "react";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import { getPercentageColor } from "../../contexts/Callbacks";
import { ProgressColor } from "../../common/ExtraData";

interface DashboardCardProps {
  title: string;
  value: number;
  percentage?: number;
  icon: React.ElementType;
  iconColor?: string;
  link?: string;
}

type ColorKey = keyof typeof ProgressColor;

// Circular progress component
const CardCircularProgress = ({
  value,
  size,
  strokeWidth,
  color,
  isPercentage = false,
}: {
  value: number;
  size: number;
  strokeWidth: number;
  color: string;
  isPercentage?: boolean;
}) => {
  const key = (color in ProgressColor ? color : "blue") as ColorKey;
  const colors = isPercentage
    ? ProgressColor[getPercentageColor(value)]
    : ProgressColor[key];

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = isPercentage
    ? circumference - (value / 100) * circumference
    : 0;

  return (
    <div
      className="relative group group-hover:opacity-100 opacity-80 transition-opacity duration-500"
      style={{ width: size, height: size }}
    >
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          className="text-[var(--yp-tertiary)]"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Foreground progress circle */}
        <circle
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          className={colors.stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            transition: "stroke-dashoffset 0.8s ease-in-out",
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>

      {/* Centered number */}
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-[var(--yp-text-secondary)]">
        {isPercentage ? (
          <>
            <CountUp end={value} duration={2} />%
          </>
        ) : (
          <CountUp end={value} duration={1.5} />
        )}
      </span>
    </div>
  );
};

// Main Dashboard Card
export default function DashboardCard({
  title,
  value,
  percentage,
  icon: Icon,
  iconColor = "blue",
  link,
}: DashboardCardProps) {
  const key = (iconColor in ProgressColor ? iconColor : "blue") as ColorKey;
  const colors = percentage
    ? ProgressColor[getPercentageColor(percentage)]
    : ProgressColor[key];

  const cardContent = (
    <div className="relative h-full bg-[var(--yp-primary)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-between gap-4 group">
      {/* Left content */}
      <div className="flex flex-col gap-2">
        <div
          className={`flex-shrink-0 w-10 h-10 p-2 rounded-xl flex items-center justify-center ${colors.bg}`}
        >
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>

        <div>
          {percentage && (
            <p className="text-lg font-bold text-[var(--yp-text-primary)]">
              <CountUp end={value} duration={1.5} />
            </p>
          )}
          <h3 className="text-sm font-medium text-[var(--yp-text-secondary)] mt-1">
            {title}
          </h3>
        </div>
      </div>

      {/* Right side - Circular Progress */}
      <div className="flex-shrink-0 self-center">
        <CardCircularProgress
          value={percentage !== undefined ? percentage : value}
          size={70}
          strokeWidth={7}
          color={iconColor}
          isPercentage={percentage !== undefined}
        />
      </div>
    </div>
  );

  return link ? <Link to={link}>{cardContent}</Link> : cardContent;
}
