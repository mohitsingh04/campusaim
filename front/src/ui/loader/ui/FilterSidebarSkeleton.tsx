"use client";
import Skeleton from "react-loading-skeleton";

const FilterSidebarSkeleton = () => {
  return (
    <div className="w-full bg-(--primary-bg) shadow-custom rounded-custom p-5 lg:w-1/4 space-y-8 lg:sticky lg:top-24 overflow-y-auto">
      <div className="flex justify-between items-center">
        <Skeleton width={70} height={25} />
        <Skeleton width={50} height={25} />
      </div>

      <div className="space-y-3">
        <Skeleton className=" mb-2 " height={20} />
        <Skeleton className="mb-3" height={35} />

        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3 w-full">
              <Skeleton width={20} />
              <Skeleton width={120} />
            </div>
            <Skeleton width={20} />
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-4 border-t border-(--border)">
        <Skeleton className="mb-2 " height={20} />
        <Skeleton className="mb-3" height={35} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3 w-full">
              <Skeleton width={20} />
              <Skeleton width={120} />
            </div>
            <Skeleton width={20} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterSidebarSkeleton;
