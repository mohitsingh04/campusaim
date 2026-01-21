"use clint";

import Skeleton from "react-loading-skeleton";

const NewsDetialSkeleton = () => {
  return (
    <div className="bg-(--primary-bg)">
      <div className="sm:px-8 px-4 py-8 flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="w-full">
            <Skeleton height={400} className="rounded-custom" />
          </div>

          <div className="p-4 shadow-custom rounded-custom">
            <div className="flex items-center space-x-4 mb-4">
              <Skeleton width={150} height={20} />
            </div>

            <div className="mb-4">
              <Skeleton height={40} width="80%" />
            </div>

            <div className="space-y-2">
              <Skeleton count={5} />
              <Skeleton width="60%" />
            </div>
          </div>

          <div className="flex items-center p-4 shadow-custom rounded-custom space-x-4">
            <div className="shrink-0">
              <Skeleton circle={true} height={64} width={64} />
            </div>
            <div className="flex-1">
              <Skeleton height={24} width={150} className="mb-2" />
              <Skeleton height={16} width={200} />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3 space-y-6">
          <div className="p-4 shadow-custom rounded-custom sticky top-20">
            <div className="mb-4">
              <Skeleton width={120} height={24} />
            </div>

            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="flex space-x-4">
                    <Skeleton
                      height={80}
                      width={80}
                      className="rounded-md shrink-0"
                    />
                    <div className="flex-1">
                      <Skeleton
                        count={2}
                        height={16}
                        style={{ marginBottom: "8px" }}
                      />
                      <Skeleton width="50%" height={14} />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetialSkeleton;
