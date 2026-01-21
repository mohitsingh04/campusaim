"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ComparisonPageSkeleton = () => {
  return (
    <div className="bg-(--primary-bg) min-h-screen p-6">
      {/* ================= SECTION 1: Basic Comparison Header ================= */}
      <div className="border border-(--border) mb-2 rounded-custom overflow-hidden ">
        <div className="p-4 border-b border-(--border) flex justify-between items-center">
          <div>
            <Skeleton width={180} height={24} className="mb-1" />
            <Skeleton width={220} height={16} />
          </div>
          <Skeleton circle width={32} height={32} />
        </div>

        <div className="grid grid-cols-4 divide-x divide-(--border) border border-(--border)">
          <div className="p-4 flex items-end "></div>
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="p-4 flex flex-col items-center space-y-4 "
              >
                {/* College Logo & Name */}
                <div className="flex flex-col items-center space-y-2">
                  <Skeleton circle height={64} width={64} />
                  <Skeleton width={140} height={20} />
                </div>

                {/* College Main Image */}
                <div className="w-full">
                  <Skeleton height={120} className="rounded-lg w-full" />
                </div>
              </div>
            ))}
        </div>

        <div className=" overflow-hidden">
          {Array(6)
            .fill(0)
            .map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-4 divide-x divide-gray-700 border-b border-gray-700 last:border-0"
              >
                {/* Column 1: Row Label (Icon + Text) */}
                <div className="p-4 flex items-center space-x-3 ">
                  <Skeleton circle height={24} width={24} />
                  <Skeleton width={120} height={16} />
                </div>

                {/* Columns 2, 3, 4: Data Pills */}
                {Array(3)
                  .fill(0)
                  .map((_, colIndex) => (
                    <div
                      key={colIndex}
                      className="p-4 flex justify-center items-center"
                    >
                      {/* The "Pill" shape skeleton */}
                      <Skeleton width={100} height={32} borderRadius="9999px" />
                    </div>
                  ))}
              </div>
            ))}
        </div>
      </div>

      {/* ================= SECTION 3: Accordions (Course/Amenities) ================= */}
      <div className="space-y-4">
        <div className="h-16 border border-(--border) rounded-custom flex items-center px-4 justify-between">
          <div className="space-y-1">
            <Skeleton width={150} height={20} />
            <Skeleton width={200} height={14} />
          </div>
          <Skeleton circle height={24} width={24} />
        </div>
        <div className="h-16 border border-(--border) rounded-custom flex items-center px-4 justify-between">
          <div className="space-y-1">
            <Skeleton width={160} height={20} />
            <Skeleton width={190} height={14} />
          </div>
          <Skeleton circle height={24} width={24} />
        </div>
      </div>
    </div>
  );
};

export default ComparisonPageSkeleton;
