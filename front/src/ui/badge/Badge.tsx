import React from "react";

interface BadgeProps {
  label: string | React.ReactNode;
  color?: string;
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  label,
  color = "gray",
  size = "sm",
  className = "",
}: BadgeProps) {
  const colors: Record<string, string> = {
    main: "var(--main-light) var(--main-emphasis)",
    green: "var(--success-subtle) var(--success-emphasis)",
    orange: "var(--orange-subtle) var(--orange-emphasis)",
    red: "var(--danger-subtle) var(--danger-emphasis)",
    yellow: "var(--warning-subtle) var(--warning-emphasis)",
    purple: "var(--purple-subtle) var(--purple-emphasis)",
    blue: "var(--blue-subtle) var(--blue-emphasis)",
    gray: "var(--gray-subtle) var(--gray-emphasis)",
  };

  const sizes: Record<string, string> = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  const [bgColor, textColor] = colors[color].split(" ");

  return (
    <span
      className={`inline-flex items-center text-link rounded-full font-medium ${sizes[size]} ${className}`}
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
