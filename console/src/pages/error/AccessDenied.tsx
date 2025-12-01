import { ArrowLeft, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";

export default function AccessDenied() {
  const navigate = useNavigate();
  return (
    <div>
      <Breadcrumbs
        title="Access Denied"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Access Denied" },
        ]}
      />
      <div className="flex items-center justify-center">
        {/* Full Width Card */}
        <div className="w-full p-8 sm:p-10 rounded-2xl shadow-sm bg-[var(--yp-primary)]">
          {/* Icon on Top */}
          <div className="flex justify-start">
            <div className="p-6 rounded-full bg-[var(--yp-red-bg)] shadow-md">
              <Lock className="w-14 h-14 sm:w-16 sm:h-16 text-[var(--yp-red-text)]" />
            </div>
          </div>

          {/* Text Content */}
          <div className="mt-6 text-start">
            {/* Error Code */}
            <h1 className="text-5xl sm:text-6xl font-extrabold text-[var(--yp-red-text)] drop-shadow">
              403
            </h1>

            {/* Title */}
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--yp-text-primary)]">
              Access Denied
            </h2>

            {/* Description */}
            <p className="mt-3 text-base sm:text-lg text-[var(--yp-muted)] leading-relaxed max-w-2xl">
              You don’t have permission to access this page. Please check with
              your administrator or return to the dashboard.
            </p>

            {/* Action Button */}
            <button
              onClick={() => navigate(-1)}
              className="mt-6 inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-[var(--yp-main)] text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
