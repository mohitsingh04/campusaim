import React from "react";
import CountUp from "react-countup";
import { getPercentageColor } from "../../contexts/Callbacks";
import { ProgressColor } from "../../common/ExtraData";

// Type for valid color keys
type ColorKey = keyof typeof ProgressColor;

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  isPercentage?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 40,
  strokeWidth = 4,
  isPercentage = false,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  // Get dynamic color based on value
  const colorKeyCandidate = getPercentageColor(value);
  const colorKey: ColorKey =
    colorKeyCandidate && ProgressColor[colorKeyCandidate as ColorKey]
      ? (colorKeyCandidate as ColorKey)
      : "blue";
  const colors = ProgressColor[colorKey];

  return (
    <div
      className={`relative rounded-full`}
      style={{ width: size, height: size }}
    >
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          className="text-gray-200 dark:text-gray-700"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        {/* Progress circle */}
        <circle
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colors.stroke}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            transition: "stroke-dashoffset 0.5s ease-in-out",
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>

      {/* Animated number */}
      <span
        className={`absolute inset-0 flex items-center justify-center !font-medium ${colors.text}`}
      >
        {isPercentage ? (
          <>
            <CountUp end={value} duration={1.5} />%
          </>
        ) : (
          <CountUp end={value} duration={1.5} />
        )}
      </span>
    </div>
  );
};
