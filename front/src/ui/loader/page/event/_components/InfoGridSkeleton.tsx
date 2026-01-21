'use client'

import Skeleton from "react-loading-skeleton";

const InfoGridSkeleton = () => {
    return (
        <div className='shadow-custom rounded-custom p-5'>
            <div className="mb-6">
                <Skeleton width={200} height={28} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-custom shadow-custom">
                        <Skeleton circle width={50} height={50} className="flex-shrink-0" />
                        <div className="flex-col flex-1">
                            <Skeleton width={80} height={14} className="mb-1" />
                            <Skeleton width="90%" height={16} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InfoGridSkeleton;