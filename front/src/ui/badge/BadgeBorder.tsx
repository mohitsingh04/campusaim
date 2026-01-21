import React from "react";

interface BadgeProps {
  label: string;
}

export function BadgeBorder({ label }: BadgeProps) {
  if (!label) return;
  return (
    <span className="inline-block py-1 px-3 rounded-full bg-(--main-light) text-(--main) text-xs font-bold uppercase tracking-wider mb-2 border border-(--main)">
      {label}
    </span>
  );
}

export default BadgeBorder;
