'use client';

import Skeleton from "react-loading-skeleton";

const HomeHeaderSkeleton = () => {
    return (
        <div className="mb-10">
            <div className="mb-4">
                <Skeleton width={180} height={32} borderRadius="9999px" />
            </div>

            <div className="mb-6">
                <Skeleton width="60%" height={48} className="max-w-xl" />
            </div>

            <div className="space-y-3">
                <Skeleton width="70%" height={20} />
                <Skeleton width="65%" height={20} />
            </div>
        </div>
    )
}

export default HomeHeaderSkeleton;