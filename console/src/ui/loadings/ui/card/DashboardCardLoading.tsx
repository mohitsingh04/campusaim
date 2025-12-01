import Skeleton from "react-loading-skeleton";

export default function DashboardSkeletonCard() {
  return (
    <div className="flex items-center justify-between bg-[var(--yp-primary)] rounded-2xl p-6 shadow-sm hover:shadow">
      {/* Left Column */}
      <div className="flex flex-col space-y-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-[var(--yp-tertiary)] flex items-center justify-center">
          <Skeleton circle width={20} height={20} />
        </div>

        {/* Number */}
        <Skeleton width={40} height={20} />

        {/* Label */}
        <Skeleton width={80} height={14} />
      </div>

      {/* Right Column: Circular Progress */}
      <div className="relative">
        <Skeleton circle width={60} height={60} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton width={30} height={14} />
        </div>
      </div>
    </div>
  );
}
