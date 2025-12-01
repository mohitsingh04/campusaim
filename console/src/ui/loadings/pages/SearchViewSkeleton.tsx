import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import BreadCrumbsSkeleton from "../ui/breadcrumbs/BreadCrumbsSkeleton";

export default function SearchViewSkeleton() {
  return (
    <div>
      <BreadCrumbsSkeleton />

      <div className="overflow-x-hidden mt-5 bg-[var(--yp-primary)] rounded-xl shadow-sm p-4 sm:p-6">
        {/* Header Filter Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex flex-wrap gap-3 items-center">
            <Skeleton width={80} height={32} borderRadius={10} />
            <Skeleton width={100} height={20} />
            <Skeleton width={140} height={28} />
          </div>
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1">
          <Skeleton height={300} />
        </div>
      </div>
    </div>
  );
}
