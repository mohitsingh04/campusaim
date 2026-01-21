import HomeHeaderSkeleton from "@/ui/loader/ui/HomeHeaderSkeleton";
import React from "react";
import Skeleton from "react-loading-skeleton";

const LocationSkeleton = () => {
  const cards = Array(5).fill(0);

  return (
    <div className="w-full mx-auto py-6 md:py-14 sm:px-8 p-2 bg-(--primary-bg)">
      <HomeHeaderSkeleton />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {cards.map((_, index) => (
          <div
            key={index}
            className="relative h-80 rounded-custom overflow-hidden"
          >
            <Skeleton height="100%" width="100%" />

            <div className="absolute bottom-0 left-0 w-full p-4">
              <div className="mb-2">
                <Skeleton width="70%" height={24} />
              </div>

              <div className="mb-2">
                <Skeleton width="50%" height={16} />
              </div>

              <div className="flex items-center gap-2">
                <Skeleton
                  circle
                  width={16}
                  height={16}
                  className="bg-(--primary-bg)"
                />
                <Skeleton width="40%" height={16} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationSkeleton;
