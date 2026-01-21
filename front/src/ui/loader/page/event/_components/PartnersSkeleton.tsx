'use client'

import Skeleton from "react-loading-skeleton";

const PartnersSkeleton = () => {
    return (
        <div className='shadow-custom rounded-custom p-5'>
            <div className="mb-6">
                <Skeleton width={220} height={28} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col">
                        <div className="h-32 w-full rounded-custom">
                            <Skeleton height="100%" containerClassName="h-full block" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PartnersSkeleton;