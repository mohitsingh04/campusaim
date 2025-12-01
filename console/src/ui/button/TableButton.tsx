import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface TableButtonProps {
  buttontype?: "button" | "link";
  href?: string;
  onClick?: () => void;
  Icon: LucideIcon;
  tooltip?: string;
  color?: string;
  size?: string;
}

export function TableButton({
  buttontype = "button",
  href,
  onClick,
  Icon,
  tooltip = "",
  color = "gray",
  size = "sm",
}: TableButtonProps) {
  const colors: Record<string, string> = {
    red: "bg-[var(--yp-red-bg)] hover:bg-[var(--yp-red-text)] text-[var(--yp-red-text)] hover:text-[var(--yp-red-bg)]",
    green:
      "bg-[var(--yp-green-bg)] hover:bg-[var(--yp-green-text)] text-[var(--yp-green-text)] hover:text-[var(--yp-green-bg)]",
    blue: "bg-[var(--yp-blue-bg)] hover:bg-[var(--yp-blue-text)] text-[var(--yp-blue-text)] hover:text-[var(--yp-blue-bg)]",
    yellow:
      "bg-[var(--yp-yellow-bg)] hover:bg-[var(--yp-yellow-text)] text-[var(--yp-yellow-text)] hover:text-[var(--yp-yellow-bg)]",
    gray: "bg-[var(--yp-gray-bg)] hover:bg-[var(--yp-gray-text)] text-[var(--yp-gray-text)] hover:text-[var(--yp-gray-bg)]",
  };

  const sizes: Record<string, string> = {
    sm: "p-1 w-8 h-8",
    md: "p-2 w-10 h-10",
  };

  const content = (
    <div className="flex items-center justify-center w-full h-full">
      <Icon className="w-4 h-4" />
    </div>
  );

  if (buttontype === "link") {
    if (!href) throw new Error("Prop `href` is required when type='link'");
    return (
      <Link
        to={href}
        title={tooltip}
        className={`${colors[color]} ${sizes[size]} rounded-lg flex items-center justify-center transition-colors`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`${colors[color]} ${sizes[size]} rounded-lg flex items-center justify-center transition-colors`}
    >
      {content}
    </button>
  );
}

export default TableButton;
