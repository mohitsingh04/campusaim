'use client'

import Skeleton from "react-loading-skeleton";

const CardSkeleton = () => {
  return (
    <div className="bg-(--primary-bg) rounded-custom shadow-custom overflow-hidden shadow-sm h-full flex flex-col">
      <Skeleton className="w-full" height={220} />

      <div className="p-5">

        <div className="flex justify-between items-start mb-3">
          <Skeleton className="h-6" width={200} />
          <Skeleton className="h-6 rounded-custom" width={70} />
        </div>

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-3">
         
          <div className="flex items-center gap-2">
            <Skeleton className="rounded-custom" height={15} width={15} />
            <Skeleton height={15} width={150} />
          </div>
          <div className="flex items-center gap-2" />

          <div className="flex items-center gap-2">
            <Skeleton className="rounded-custom" height={15} width={15} />
            <Skeleton height={15} width={150} />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="rounded-custom" height={15} width={15} />
            <Skeleton height={15} width={150} />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="rounded-custom" height={15} width={15} />
            <Skeleton height={15} width={150} />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="rounded-custom" height={15} width={15} />
            <Skeleton height={15} width={150} />
          </div>
        </div>

        <div className="mt-auto">
          <Skeleton className="h-10 w-full rounded-custom" />
        </div>
      </div>
    </div>
  );
};

export default CardSkeleton;