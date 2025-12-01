import Skeleton from "react-loading-skeleton";
import { SidbarNavigations } from "../../../common/RouteData";
import { useState } from "react";

export default function SidebarSkeleton() {
  const [sidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? saved === "true" : false;
  });

  return (
    <div
      className={`hidden lg:flex fixed inset-y-0 left-0 bg-[var(--yp-primary)] border-r border-[var(--yp-border-primary)] transition-all duration-300 ${
        sidebarCollapsed ? "w-16" : "w-64"
      } flex-col z-40`}
    >
      {/* Logo */}
      <div
        className={`flex items-center justify-center px-2 py-6 border-b border-[var(--yp-border-primary)] flex-shrink-0 transition-all duration-300 ${
          sidebarCollapsed ? "px-0" : "px-4"
        }`}
      >
        {sidebarCollapsed ? (
          <Skeleton circle width={32} height={32} />
        ) : (
          <Skeleton width={220} height={32} />
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-3 overflow-y-auto scrollbar-none">
        <div className="space-y-4">
          {[...Array(SidbarNavigations?.length || 5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-2">
              <Skeleton width={25} height={25} />
              {!sidebarCollapsed && <Skeleton width={150} height={10} />}
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
