'use client'

import Skeleton from "react-loading-skeleton";

const HighlightsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Highlights */}
            <div className="p-5 rounded-custom shadow-custom">
                <div className="mb-6">
                    <Skeleton width={180} height={26} />
                </div>
                <div className="space-y-4">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <Skeleton circle width={20} height={20} />
                            <div className="flex-1">
                                <Skeleton count={1} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Requirements */}
            <div className="p-5 rounded-custom shadow-custom">
                <div className="mb-6">
                    <Skeleton width={160} height={26} />
                </div>
                <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <Skeleton circle width={20} height={20} />
                            <div className="flex-1">
                                <Skeleton count={1} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HighlightsSkeleton;