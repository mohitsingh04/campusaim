import BreadCrumbsSkeleton from "../ui/breadcrumbs/BreadCrumbsSkeleton";
import TableSkeleton from "../ui/tables/TableSkeleton";

export default function TableSkeletonWithOutCards() {
  return (
    <div className="space-y-6">
      <BreadCrumbsSkeleton />
      <TableSkeleton />
    </div>
  );
}
