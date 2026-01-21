'use client'

import Skeleton from "react-loading-skeleton";

export const InfoGridSkeleton = () => {
    return (
        <div className="p-5 shadow-custom rounded-custom  ">
            <div className="mb-6">
                <Skeleton width={180} height={24} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-(--primary-bg)">
                        {/* Icon */}
                        <Skeleton circle width={40} height={40} containerClassName="flex-shrink-0" />
                        <div className="flex-1">
                            <Skeleton width={60} height={12} className="mb-1" />
                            <Skeleton width="90%" height={14} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};