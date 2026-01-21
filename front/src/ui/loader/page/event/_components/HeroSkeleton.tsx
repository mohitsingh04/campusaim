'use client'

import Skeleton from "react-loading-skeleton";

const HeroSkeleton = () => {
    return (
        <div className="space-y-6">

            <div className="w-full h-[400px] rounded-custom">
                <Skeleton height="100%" className="h-full block" />
            </div>

            <div className="space-y-4 shadow-custom rounded-custom p-5">
                <Skeleton height={32} width="80%" className='mb-4' />
                <Skeleton count={3} />
            </div>
        </div>
    );
};

export default HeroSkeleton;