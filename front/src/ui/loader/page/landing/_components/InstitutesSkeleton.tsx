"use client";

import HomeHeaderSkeleton from "@/ui/loader/ui/HomeHeaderSkeleton";
import Skeleton from "react-loading-skeleton";

const InstitutesSkeleton = () => {
  const logos = Array(16).fill(0);

  return (
    <div className="w-full mx-auto py-6 md:py-14 sm:px-8 p-2 bg-(--primary-bg)">
      <HomeHeaderSkeleton />

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-6">
        {logos.map((_, index) => (
          <div
            key={index}
            className={`justify-center ${
              index >= 6 ? "hidden lg:flex" : "flex"
            }`}
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32">
              <Skeleton height="80%" width="80%" borderRadius={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstitutesSkeleton;
