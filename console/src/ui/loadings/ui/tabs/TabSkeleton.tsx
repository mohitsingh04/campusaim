import Skeleton from "react-loading-skeleton";

export default function TabSkeleton() {
  return (
    <div className="bg-[var(--yp-primary)] rounded-2xl shadow-sm">
      <div className="flex items-center gap-6 border-b border-[var(--yp-border-primary)] p-5 py-3 mb-4">
        <Skeleton width={120} height={22} />
        <Skeleton width={100} height={22} />
      </div>

      {/* Two-column info skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 p-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton width={130} height={24} />
            <Skeleton width={180} height={24} />
          </div>
        ))}
      </div>
    </div>
  );
}
