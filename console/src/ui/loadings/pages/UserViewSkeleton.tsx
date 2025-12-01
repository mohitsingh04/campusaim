import Skeleton from "react-loading-skeleton";
import BreadCrumbsSkeleton from "../ui/breadcrumbs/BreadCrumbsSkeleton";
import TabSkeleton from "../ui/tabs/TabSkeleton";

export default function UserViewSkeleton() {
  return (
    <div className="space-y-5">
      {/* Breadcrumb Skeleton */}
      <BreadCrumbsSkeleton />

      {/* Profile Header */}
      <div className="bg-[var(--yp-primary)] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-5">
          <Skeleton circle width={90} height={90} />
          <div className="space-y-2">
            <Skeleton width={180} height={24} borderRadius={6} /> {/* Name */}
            <Skeleton width={100} height={18} borderRadius={6} />
            <div className="flex gap-10 mt-3">
              <div>
                <Skeleton width={25} height={20} />
                <Skeleton width={60} height={14} />
              </div>
              <div>
                <Skeleton width={25} height={20} />
                <Skeleton width={80} height={14} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <TabSkeleton />
    </div>
  );
}
