'use client'

import Skeleton from "react-loading-skeleton";

const WhatsIncludedSkeleton = () => {
    return (
        <div className="rounded-custom p-5 shadow-custom">
            <div className="mb-4">
                <Skeleton width={160} height={24} />
            </div>
            <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton circle width={20} height={20} />
                        <div className="flex-1">
                            <Skeleton width={`70%`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WhatsIncludedSkeleton;