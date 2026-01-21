'use client'
import Skeleton from "react-loading-skeleton";

const ContentHeaderSkeleton = () => {
  return (
    <div className="bg-(--primary-bg) p-5 mb-6 rounded-custom shadow-custom flex flex-col-2 sm:flex-row justify-between items-center">
      <div className="space-y-2 sm:mb-0">
        <Skeleton height={30} width={200} />
        <Skeleton height={20} width={100} />
      </div>
      <div className="flex gap-2">
        <Skeleton className="rounded-custom" width={30} height={30} />
        <Skeleton className="rounded-custom" width={30} height={30} />
      </div>
    </div>
  );
};

export default ContentHeaderSkeleton;