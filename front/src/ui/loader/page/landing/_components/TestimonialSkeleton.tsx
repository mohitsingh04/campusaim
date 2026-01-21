"use client";

import HomeHeaderSkeleton from "@/ui/loader/ui/HomeHeaderSkeleton";
import Skeleton from "react-loading-skeleton";

const TestimonialsSkeleton = () => {
  return (
    <div className="w-full mx-auto py-6 md:py-14 sm:px-8 p-2 bg-(--primary-bg)">
      <HomeHeaderSkeleton />

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-start relative space-y-8 pl-4">
          <div className="absolute left-14 top-18 bottom-10 w-0.5 border-l-2 border-dashed border-(--border) hidden lg:block"></div>

          <div className="flex items-center gap-4 relative z-10 opacity-50">
            <Skeleton circle width={60} height={60} />
            <div className="hidden lg:block">
              <Skeleton width={120} height={20} />
              <Skeleton width={80} height={14} />
            </div>
          </div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="p-1 rounded-full">
              <Skeleton circle width={90} height={90} />
            </div>
            <div className="hidden lg:block">
              <Skeleton width={160} height={24} />
              <Skeleton width={100} height={16} />
            </div>
          </div>

          <div className="flex items-center gap-4 relative z-10 opacity-50">
            <Skeleton circle width={60} height={60} />
            <div className="hidden lg:block">
              <Skeleton width={120} height={20} />
              <Skeleton width={80} height={14} />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-2/3 p-2">
          <div className="mb-8 space-y-3">
            <Skeleton height={20} width="100%" />
            <Skeleton height={20} width="95%" />
            <Skeleton height={20} width="60%" />
          </div>

          <div className="mb-4">
            <Skeleton width={100} height={16} />
          </div>

          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} circle width={24} height={24} />
            ))}
          </div>

          <div>
            <div className="mb-2">
              <Skeleton width={180} height={28} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSkeleton;
