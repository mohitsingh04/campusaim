"use client";
import Skeleton from "react-loading-skeleton";

const MobileBottomBar = () => {
  return (
    <div>
      <div className="fixed sm:hidden bottom-0 left-0 right-0 bg-(--primary-bg) h-16 flex items-center justify-center z-10 ">
        <div className="flex flex-col items-center gap-1 w-16">
          <Skeleton width={24} height={24} />
          <Skeleton width={32} height={12} />
        </div>

        <div className="flex flex-col items-center gap-1 w-16">
          <Skeleton width={24} height={24} />
          <Skeleton width={48} height={12} />
        </div>

        <div className="relative -top-6">
          <div className="p-1 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.15)]">
            <Skeleton circle width={56} height={56} className="block" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 w-16">
          <Skeleton width={24} height={24} />
          <Skeleton width={40} height={12} />
        </div>

        <div className="flex flex-col items-center gap-1 w-16">
          <Skeleton width={24} height={24} />
          <Skeleton width={32} height={12} />
        </div>
      </div>
    </div>
  );
};

export default MobileBottomBar;
