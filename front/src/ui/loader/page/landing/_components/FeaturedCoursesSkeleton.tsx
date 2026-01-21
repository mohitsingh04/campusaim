import HomeHeaderSkeleton from "@/ui/loader/ui/HomeHeaderSkeleton";
import React from "react";
import Skeleton from "react-loading-skeleton";

const FeaturedCoursesSkeleton = () => {
  const cards = Array(3).fill(0);

  return (
    <div className="w-full mx-auto py-6 md:py-14 sm:px-8 p-2 relative bg-(--primary-bg)">
      <HomeHeaderSkeleton />

      <div className="relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden lg:block">
          <Skeleton circle={true} height={40} width={40} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((_, index) => (
            <div
              key={index}
              className="border border-(--border) rounded-2xl overflow-hidden "
            >
              <div className="relative h-48 sm:h-56">
                <Skeleton height="100%" width="100%" />
                <div className="absolute top-4 left-4">
                  <Skeleton width={80} height={24} borderRadius={50} />
                </div>
              </div>

              <div className="p-5">
                <div className="mb-4">
                  <Skeleton height={24} width="90%" />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Skeleton
                      circle={true}
                      height={16}
                      width={16}
                      className="mr-2"
                    />
                    <Skeleton width={50} height={16} />
                  </div>

                  <div>
                    <Skeleton width={90} height={16} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden lg:block">
          <Skeleton circle={true} height={40} width={40} />
        </div>
      </div>
    </div>
  );
};

export default FeaturedCoursesSkeleton;
