import React from "react";

/**
 * @param {number} value - 0 to 100
 * @param {number} size - diameter in px
 * @param {number} stroke - stroke width
 */
export default function CircleProgress({
    value = 0,
    size = 44,
    stroke = 4,
}) {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(value, 0), 100);
    const offset = circumference - (progress / 100) * circumference;

    const color =
        progress >= 80
            ? "#22c55e" // green
            : progress >= 50
                ? "#f59e0b" // yellow
                : "#ef4444"; // red

    return (
        <div className="relative flex items-center justify-center">
            <svg width={size} height={size}>
                {/* Background */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth={stroke}
                    fill="none"
                />

                {/* Progress */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={stroke}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>

            {/* Label */}
            <span className="absolute text-xs font-semibold text-gray-700">
                {progress}%
            </span>
        </div>
    );
}
