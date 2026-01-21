import HomeHeaderSkeleton from "@/ui/loader/ui/HomeHeaderSkeleton";
import React from "react";
import Skeleton from "react-loading-skeleton";

const AcademicTypeSkeleton = () => {
  const cards = Array(5).fill(0);

  return (
    <div className="py-6 md:py-14 sm:px-8 p-2 bg-(--primary-bg)">
      <HomeHeaderSkeleton />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {cards.map((_, index) => (
          <div
            key={index}
            className="bg-(--primary-bg) p-6 rounded-2xl border border-(--border) flex flex-col h-full"
          >
            <div className="mb-5">
              <Skeleton width={56} height={56} borderRadius="1rem" />
            </div>

            <Skeleton width="70%" height={24} className="mb-2" />

            <div className="space-y-2 grow">
              <Skeleton count={3} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AcademicTypeSkeleton;
