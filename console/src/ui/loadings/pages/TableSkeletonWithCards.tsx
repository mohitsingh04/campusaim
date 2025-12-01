import DashboardSkeletonCard from "../ui/card/DashboardCardLoading";
import BreadCrumbsSkeleton from "../ui/breadcrumbs/BreadCrumbsSkeleton";
import TableSkeleton from "../ui/tables/TableSkeleton";

export default function TableSkeletonWithCards() {
  return (
    <div className="space-y-6">
      <BreadCrumbsSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <DashboardSkeletonCard key={i} />
        ))}
      </div>

      <TableSkeleton />
    </div>
  );
}
