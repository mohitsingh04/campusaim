"use client";

import Skeleton from "react-loading-skeleton";


export function SkeletonMessage() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-3 max-w-[80%] md:max-w-[70%]">
        <Skeleton className="flex-shrink-0 w-8 h-8 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
    </div>
  );
}
