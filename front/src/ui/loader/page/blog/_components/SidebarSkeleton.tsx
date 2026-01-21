'use client'

import Skeleton from "react-loading-skeleton";

const SidebarSkeleton = () => {
    return (
        <div className="flex gap-4 mb-4 items-start">
            <div className="w-16 h-16 flex-shrink-0">
                <Skeleton height="100%" className="h-full block rounded-custom" />
            </div>
            <div className="flex-1">
                <Skeleton count={2} height={14} className="mb-1" />
                <Skeleton width="60%" height={12} />
            </div>
        </div>
    );
};

export default SidebarSkeleton;