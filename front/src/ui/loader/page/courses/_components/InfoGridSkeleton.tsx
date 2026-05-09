"use client";

import Skeleton from "react-loading-skeleton";

export const InfoGridSkeleton = ({ limit = 4 }: { limit?: number }) => {
  return (
    <div>
      <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
        <div className="mb-6">
          <Skeleton width={180} height={24} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(limit)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg">
                <Skeleton
                  circle
                  width={40}
                  height={40}
                  containerClassName="flex-shrink-0"
                />
                <div className="flex-1">
                  <Skeleton width={60} height={12} className="mb-1" />
                  <Skeleton width="90%" height={14} />
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 mt-4 gap-6">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="bg-(--primary-bg) p-5 rounded-custom shadow-custom"
            >
              <div className="mb-6">
                <Skeleton width={180} height={24} />
              </div>
              <div className="mb-2">
                <Skeleton width={240} height={24} />
              </div>
              <div className="mb-2">
                <Skeleton width={240} height={24} />
              </div>
              <div className="mb-2">
                <Skeleton width={240} height={24} />
              </div>
              <div className="mb-2">
                <Skeleton width={240} height={24} />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
