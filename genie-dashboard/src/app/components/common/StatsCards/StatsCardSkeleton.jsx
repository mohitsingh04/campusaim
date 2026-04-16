import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function StatsCardSkeleton({ count = 4 }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, idx) => (
                <div
                    key={idx}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                    <div className="flex items-center">
                        {/* Icon skeleton */}
                        <div className="p-2 rounded-lg bg-gray-100">
                            <Skeleton circle width={24} height={24} />
                        </div>

                        {/* Text skeleton */}
                        <div className="ml-4 space-y-2">
                            <Skeleton width={110} height={14} />
                            <Skeleton width={70} height={24} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}