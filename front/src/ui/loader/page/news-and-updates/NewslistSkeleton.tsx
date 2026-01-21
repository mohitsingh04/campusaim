"use client";

import Skeleton from "react-loading-skeleton";

const NewsListSkeleton = () => {
  return (
    <div className="py-8 bg-(--primary-bg)">
      <div className="sm:px-8 px-4 space-y-8">
        <div className="w-xl">
          <Skeleton height={40} borderRadius="0.5rem" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-6 border-b border-(--border) pb-6 last:border-0"
                >
                  <div className="flex-1">
                    <div className="mb-2">
                      <Skeleton height={24} width="90%" />
                      <Skeleton height={24} width="70%" />
                    </div>

                    <div className="mb-4">
                      <Skeleton count={3} />
                    </div>

                    <div>
                      <Skeleton width={180} height={16} />
                    </div>
                  </div>

                  <div className="w-full md:w-64 shrink-0">
                    <Skeleton height={160} className="rounded-lg" />
                  </div>
                </div>
              ))}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="space-y-6 shadow-custom p-5 rounded-custom">
              <Skeleton
                height={30}
                width={120}
                className="rounded-custom mb-6"
              />
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    <div className="w-24 shrink-0">
                      <Skeleton height={60} className="rounded-md" />
                    </div>
                    <div className="flex-1">
                      <Skeleton count={2} height={14} />
                    </div>
                  </div>
                ))}
            </div>
            <div>
              <div className="space-y-6 pt-6 shadow-custom p-5 rounded-custom">
                <Skeleton
                  height={30}
                  width={120}
                  className="rounded-custom mb-6"
                />
                {Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <div className="w-24 shrink-0">
                        <Skeleton height={60} className="rounded-md" />
                      </div>
                      <div className="flex-1">
                        <Skeleton count={2} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsListSkeleton;
