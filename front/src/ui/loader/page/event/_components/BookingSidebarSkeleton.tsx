'use client'

import Skeleton from "react-loading-skeleton";

const BookingSidebarSkeleton = () => {
    return (
        <div className="rounded-custom p-5 shadow-custom sticky top-18">
            <div className="flex flex-col items-center mb-6">
                <Skeleton width={120} height={36} className="mb-2" />
                <Skeleton width={80} height={15} />
            </div>
            <div className="space-y-4 mb-8">
                {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Skeleton circle width={20} height={20} />
                            <Skeleton width={60} />
                        </div>
                        <Skeleton width={100} />
                    </div>
                ))}
            </div>
            <div className="mb-6">
                <Skeleton height={50} borderRadius={8} />
            </div>
            <div>
                <Skeleton width={100} height={20} className="mb-2" />
                <Skeleton count={2} height={14} />
            </div>
        </div>
    );
};

export default BookingSidebarSkeleton;