"use client";

import Skeleton from "react-loading-skeleton";

const FAQSkeleton = () => {
  return (
    <div className="w-full mx-auto py-6 md:py-14 sm:px-8 p-2 bg-(--primary-bg)">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        <div className="w-full lg:w-1/3 flex flex-col space-y-6">
          <div>
            <Skeleton width={220} height={32} borderRadius={50} />
          </div>

          <div className="space-y-2">
            <Skeleton width="90%" height={50} className="max-w-md" />
            <Skeleton width="70%" height={50} className="max-w-sm" />
            <Skeleton width="80%" height={50} className="max-w-sm" />
          </div>

          <div className="space-y-3 pt-2">
            <Skeleton count={1} height={18} width="100%" />
            <Skeleton count={1} height={18} width="95%" />
            <Skeleton count={1} height={18} width="85%" />
          </div>
        </div>

        <div className="w-full lg:w-2/3 flex flex-col space-y-10">
          <div>
            <div className="mb-4">
              <Skeleton height={28} width="90%" />
            </div>
            <div className="space-y-2 mb-8">
              <Skeleton height={16} width="100%" />
              <Skeleton height={16} width="98%" />
              <Skeleton height={16} width="92%" />
            </div>
            <Skeleton height={1} width="100%" />
          </div>

          <div>
            <div className="mb-4">
              <Skeleton height={28} width="85%" />
            </div>
            <div className="space-y-2 mb-8">
              <Skeleton height={16} width="100%" />
              <Skeleton height={16} width="95%" />
            </div>
            <Skeleton height={1} width="100%" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSkeleton;
