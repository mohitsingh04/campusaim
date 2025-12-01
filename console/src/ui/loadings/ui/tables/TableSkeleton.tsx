import Skeleton from "react-loading-skeleton";

export default function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-800">
      {/* Horizontal scroll wrapper */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]"> {/* Ensures scroll on small screens */}
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`grid grid-cols-6 gap-4 p-4 items-center ${
                i % 2 === 1 ? "bg-[var(--yp-secondary)]" : "bg-[var(--yp-primary)]"
              }`}
            >
              <Skeleton className="w-full max-w-[20px]" height={14} />
              <Skeleton className="w-full max-w-[100px]" height={14} />
              <Skeleton className="w-full max-w-[160px]" height={14} />
              <Skeleton className="w-full max-w-[120px]" height={14} />
              <Skeleton className="w-full max-w-[60px]" height={20} />
              <div className="flex space-x-2">
                <Skeleton width={32} height={32} />
                <Skeleton width={32} height={32} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
