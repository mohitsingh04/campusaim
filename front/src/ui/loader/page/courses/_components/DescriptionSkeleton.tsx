'use client'

import Skeleton from "react-loading-skeleton";

const DescriptionSkeleton = () => {
    return (
        <div className="rounded-custom p-5 shadow-custom">
            <div className="space-y-3 mb-4">
                <Skeleton count={2} />
                <Skeleton width="80%" />
            </div>
            <div>
                <Skeleton width={100} height={20} />
            </div>
        </div>
    );
};

export default DescriptionSkeleton;