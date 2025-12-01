import DashboardSkeletonCard from "../ui/card/DashboardCardLoading";

export default function DashboardSkeleton({ limit = 8 }) {
  return (
    <div className="space-y-8">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array(limit)
          .fill(true)
          .map((_, index) => (
            <DashboardSkeletonCard key={index} />
          ))}
      </div>
    </div>
  );
}
