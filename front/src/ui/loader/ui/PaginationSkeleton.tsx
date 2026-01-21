'use client'

import Skeleton from "react-loading-skeleton";

const PaginationSkeleton = () => {
  return (
    <div className="flex  justify-center items-center gap-2 mt-12">
      <Skeleton className="rounded-custom" width={50} height={30} />
      <Skeleton className="rounded-custom" width={30} height={30} />
      <Skeleton className="rounded-custom" width={30} height={30} />
      <Skeleton className="rounded-custom" width={30} height={30} />
      <Skeleton className="rounded-custom" width={30} height={30} />
      <Skeleton className="rounded-custom" width={50} height={30} />
    </div>
  );
};

export default PaginationSkeleton;