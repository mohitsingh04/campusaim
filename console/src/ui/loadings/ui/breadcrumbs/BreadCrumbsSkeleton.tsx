import Skeleton from "react-loading-skeleton";

export default function BreadCrumbsSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <Skeleton width={160} height={24} />
        <div className="flex items-center space-x-2 mt-2 text-[var(--yp-text-primary)]">
          <Skeleton width={60} height={14} />
          <span>/</span>
          <Skeleton width={80} height={14} />
          <span>/</span>
          <Skeleton width={100} height={14} />
        </div>
      </div>

      <div className="text-end">
        <Skeleton width={100} height={36} borderRadius={8} />
      </div>
    </div>
  );
}
