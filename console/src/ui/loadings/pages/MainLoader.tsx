import Skeleton from "react-loading-skeleton";
import SidebarSkeleton from "./SidebarSkeleton";
import DashboardSkeleton from "./DashboardSkeleton";
import BreadCrumbsSkeleton from "../ui/breadcrumbs/BreadCrumbsSkeleton";
import { useState } from "react";

export default function MainLoader() {
  const [sidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? saved === "true" : false;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[var(--yp-secondary)]">
      <div className="flex flex-1">
        <SidebarSkeleton />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
          }`}
        >
          {/* Header */}
          <header className="sticky top-0 bg-[var(--yp-primary)] border-b border-[var(--yp-border-primary)] px-4 lg:px-6 py-6 z-100 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton width={32} height={32} />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton width={32} height={32} />
                <Skeleton width={32} height={32} />
                <Skeleton width={32} height={32} />
                <Skeleton width={32} height={32} />
                <Skeleton width={100} height={32} />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="p-4 space-y-4">
            <BreadCrumbsSkeleton />
            <DashboardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
