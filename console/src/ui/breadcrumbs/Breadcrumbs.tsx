import { ArrowLeft, LucideIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface Breadcrumbs {
  label: string;
  path?: string;
}

interface ExtraButton {
  label: string;
  path?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "tertiary";
}

interface BreadcrumbsProps {
  title: string;
  breadcrumbs: Breadcrumbs[];
  extraButtons?: ExtraButton[];
}

export function Breadcrumbs({
  title,
  breadcrumbs,
  extraButtons,
}: BreadcrumbsProps) {
  const navigate = useNavigate();

  const btnBase =
    "inline-flex items-center justify-center px-3 py-2 rounded-lg shadow-sm text-xs font-medium transition-colors whitespace-nowrap";

  const btnVariants = {
    primary: "text-[var(--yp-gray-text)] bg-[var(--yp-gray-bg)]",
    secondary: "text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]",
    tertiary: "text-[var(--yp-orange-text)] bg-[var(--yp-orange-bg)]",
  };

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between w-full gap-3 flex-wrap">
        {/* LEFT SIDE: Title + Breadcrumbs */}
        <div className="flex flex-col items-start gap-3 min-w-0 flex-wrap">
          <h1 className="text-base md:text-lg font-semibold text-[var(--yp-text-primary)] truncate">
            {title}
          </h1>

          <div className="flex items-center flex-wrap gap-1 text-xs text-[var(--yp-muted)]">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1">
                {crumb.path ? (
                  <Link
                    to={crumb.path}
                    className="text-[var(--yp-main)] hover:underline"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className="text-[var(--yp-muted)]">/</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {extraButtons?.map((btn, index) => {
            const Icon = btn.icon;
            const btnClasses = `${btnBase} ${
              btnVariants[btn.variant || "secondary"]
            }`;

            return btn.path ? (
              <Link
                key={index}
                to={btn.path}
                className={`${btnClasses} hover:opacity-80`}
                title={btn.label}
              >
                {Icon && <Icon className="w-4 h-4 md:mr-2" />}
                <span className="hidden md:inline">{btn.label}</span>
              </Link>
            ) : (
              <button
                key={index}
                onClick={btn.onClick}
                className={btnClasses}
                title={btn.label}
              >
                {Icon && <Icon className="w-4 h-4 md:mr-2" />}
                <span className="hidden md:inline">{btn.label}</span>
              </button>
            );
          })}

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className={`${btnBase} ${btnVariants.primary}`}
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
