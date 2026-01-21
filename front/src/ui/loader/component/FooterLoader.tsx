import React from "react";
import Skeleton from "react-loading-skeleton";

const FooterLoader = () => {
  return (
    <footer className="w-full bg-(--primary-bg) pt-16 pb-6 border-t border-(--border)">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-8 mb-16">
          <div className="flex flex-col space-y-4">
            <Skeleton width={80} height={20} className="mb-2" />

            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton width={30} height={20} />
                <Skeleton width={100} height={20} />
              </div>
            ))}
          </div>

          {[...Array(6)].map((_, colIndex) => (
            <div key={colIndex} className="flex flex-col space-y-4">
              <Skeleton width={100} height={20} className="mb-2" />

              {[...Array(6)].map((_, itemIndex) => (
                <Skeleton
                  key={itemIndex}
                  width={itemIndex % 2 === 0 ? "70%" : "90%"}
                  height={14}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="w-full h-px border-t border-(--border) mb-8" />

        <div className="flex flex-col items-center space-y-6">
          <div className="flex flex-wrap justify-center gap-6 w-full">
            <Skeleton width={100} height={24} />
            <Skeleton width={120} height={24} />
            <Skeleton width={110} height={24} />
            <Skeleton width={140} height={24} />
            <Skeleton width={100} height={24} />
          </div>

          <div className="flex justify-center gap-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} circle width={30} height={30} />
            ))}
          </div>

          <div className="w-full h-px border-t border-(--border) mb-8" />
          <div className="flex flex-col items-center space-y-3 w-full">
            <div className="flex flex-wrap justify-center gap-4">
              <Skeleton width={80} height={14} />
              <Skeleton width={100} height={14} />
              <Skeleton width={60} height={14} />
              <Skeleton width={60} height={14} />
              <Skeleton width={80} height={14} />
            </div>

            <Skeleton width={250} height={12} />
            <Skeleton width={180} height={12} />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterLoader;
