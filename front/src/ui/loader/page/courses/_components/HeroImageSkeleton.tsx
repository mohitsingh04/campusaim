'use client'

import Skeleton from "react-loading-skeleton";

const HeroImageSkeleton = () => {
    return (
        <div className="h-[400px] sticky top-20">
            <Skeleton height="100%" className="h-full block" />
        </div>
    );
};

export default HeroImageSkeleton;