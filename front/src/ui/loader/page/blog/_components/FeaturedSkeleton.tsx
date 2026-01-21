'use client'

import Skeleton from "react-loading-skeleton";

const FeaturedSkeleton = () => {
    return (
        <div className='space-y-6'>
            <div className="w-full shadow-custom rounded-custom">

                <div className="w-full h-[400px] overflow-hidden">
                    <Skeleton height="100%" containerClassName="h-full block" />
                </div>

                <div className='p-5'>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                        <div className="flex gap-2">
                            <Skeleton width={80} height={30} className='rounded-custom' />
                            <Skeleton width={100} height={30} className='rounded-custom' />
                        </div>
                        <Skeleton width={150} />
                    </div>

                    <div className="mb-6">
                        <Skeleton height={40} width="90%" className="mb-2" />
                        <Skeleton count={4} className="mb-2" />
                    </div>

                    <div>
                        <Skeleton width={60} className="mb-2" />
                        <div className="flex gap-2">
                            <Skeleton width={80} height={30} className='rounded-custom' />
                            <Skeleton width={120} height={30} className='rounded-custom' />
                        </div>
                    </div>
                </div>
            </div>

            {/* Author section */}
            <div className="p-5 rounded-custom shadow-custom flex items-center gap-4">
                <div>
                    <Skeleton circle width={60} height={60} />
                </div>
                <div className="flex flex-col">
                    <Skeleton width={180} height={20} className="mb-2" />
                    <Skeleton width={120} height={15} />
                </div>
            </div>
        </div>

    );
};

export default FeaturedSkeleton;