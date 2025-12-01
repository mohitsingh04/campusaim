import React from "react";

interface BadgeProps {
  label: string | React.ReactNode;
  color?: string;
  size?: "sm" | "md";
}

export function Badge({ label, color = "gray", size = "sm" }: BadgeProps) {
  const colors: Record<string, string> = {
    green: "var(--yp-green-bg) var(--yp-green-text)",
    red: "var(--yp-red-bg) var(--yp-red-text)",
    blue: "var(--yp-blue-bg) var(--yp-blue-text)",
    orange: "var(--yp-orange-bg) var(--yp-orange-text)",
    yellow: "var(--yp-yellow-bg) var(--yp-yellow-text)",
    gray: "var(--yp-gray-bg) var(--yp-gray-text)",
  };

  const sizes: Record<string, string> = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  const [bgColor, textColor] = colors[color].split(" ");

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold ${sizes[size]}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {label}
    </span>
  );
}

export default Badge;
