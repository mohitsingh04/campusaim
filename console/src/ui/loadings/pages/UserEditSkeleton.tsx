import Skeleton from "react-loading-skeleton";
import BreadCrumbsSkeleton from "../ui/breadcrumbs/BreadCrumbsSkeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function UserEditSkeleton() {
  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <BreadCrumbsSkeleton />

      {/* Main Container */}
      <div className="bg-[var(--yp-primary)] rounded-2xl p-6 shadow-sm mt-3">
        {/* Two-column Form Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton width={120} height={16} />
              <Skeleton height={42} borderRadius={8} />
            </div>
          ))}
        </div>

        {/* Verified Toggle */}
        <div className="mt-2 flex gap-2 items-center">
          <Skeleton width={120} height={16} />
          <Skeleton width={60} height={30} borderRadius={13} />
        </div>

        {/* Select All + Save Button */}
        <div className="flex items-center justify-between mt-2 border-t border-[var(--yp-border-primary)] pt-2">
          <Skeleton width={130} height={38} borderRadius={8} />
        </div>
      </div>
    </div>
  );
}
