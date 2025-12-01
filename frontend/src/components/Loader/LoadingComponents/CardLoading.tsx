import React from "react";
import Skeleton from "react-loading-skeleton";

export default function CardLoading() {
  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg overflow-hidden border border-gray-100">
      {/* Image */}
      <div className="relative">
        <div className="w-full h-48 md:h-60">
          <Skeleton width="100%" height="100%" />
        </div>
        {/* Rating Badge */}
        <div className="absolute top-3 md:top-4 right-3 md:right-4">
          <div className="w-12 md:w-15 h-6 md:h-7">
            <Skeleton width="100%" height="100%" />
          </div>
        </div>
        {/* Category Badge */}
        <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4">
          <div className="w-20 md:w-25 h-6 md:h-8">
            <Skeleton width="100%" height="100%" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        {/* Location */}
        <div className="flex items-center mb-2 md:mb-3">
          <div className="w-3 h-3 md:w-4 md:h-4 mr-2">
            <Skeleton circle width="100%" height="100%" />
          </div>
          <div className="w-16 md:w-20">
            <Skeleton height={12} className="md:h-4" />
          </div>
        </div>

        {/* Title */}
        <div className="mb-2 md:mb-3">
          <Skeleton height={18} className="md:h-6" width="90%" />
        </div>

        {/* Read More */}
        <div className="w-20 md:w-25">
          <Skeleton height={16} className="md:h-5" />
        </div>
      </div>
    </div>
  );
}
