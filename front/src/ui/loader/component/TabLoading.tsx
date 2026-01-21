"use client";

import Skeleton from "react-loading-skeleton";

const TabLoading = () => {
  return (
    <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
      <div className="rounded-custom flex gap-6 mb-6 overflow-x-auto scrollbar-hide">
        <Skeleton width={80} height={20} />
        <Skeleton width={80} height={20} />
        <Skeleton width={80} height={20} />
        <Skeleton width={80} height={20} />
        <Skeleton width={80} height={20} />
        <Skeleton width={80} height={20} />
        <Skeleton width={80} height={20} />
      </div>

      <Skeleton width={250} height={28} className="mb-4" />
      <Skeleton count={6} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <div className="p-5 rounded-custom shadow-custom">
          <Skeleton width={100} height={20} className="mb-3" />
          <Skeleton count={3} className="mb-1" />
        </div>
        <div className="p-4 rounded-custom shadow-custom">
          <Skeleton width={120} height={20} className="mb-3" />
          <div className="space-y-2">
            <Skeleton width="80%" />
            <Skeleton width="70%" />
            <Skeleton width="60%" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabLoading;
