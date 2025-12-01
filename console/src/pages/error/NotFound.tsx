import { Home, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--yp-secondary)] px-6">
      <div className="bg-[var(--yp-primary)] p-10 rounded-2xl shadow-sm text-center max-w-lg w-full">
        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-[var(--yp-red-bg)] p-6 rounded-full">
            <AlertTriangle
              className="text-[var(--yp-red-text)]"
              size={60}
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-8xl font-extrabold text-[var(--yp-red-text)] mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-[var(--yp-text-primary)] mb-4">
          Oops! Page not found
        </h2>

        {/* Description */}
        <p className="text-[var(--yp-muted)] mb-8 leading-relaxed">
          The page you’re looking for doesn’t exist or has been moved. Please
          check the URL or go back to the homepage.
        </p>

        {/* Button */}
        <Link
          to={`/dashboard`}
          className="flex items-center justify-center gap-2 bg-[var(--yp-main)] text-white px-6 py-3 rounded-xl shadow-lg transition-all w-full hover:opacity-80"
        >
          <Home size={20} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
