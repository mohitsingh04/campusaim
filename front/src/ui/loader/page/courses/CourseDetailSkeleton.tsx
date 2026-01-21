"use client";

import Skeleton from "react-loading-skeleton";
import HeaderSkeleton from "./_components/HeaderSkeleton";
import { InfoGridSkeleton } from "./_components/InfoGridSkeleton";
import HighlightsSkeleton from "./_components/HighlightSkeleton";
import WhatsIncludedSkeleton from "./_components/WhatsIncludedSkeleton";
import DescriptionSkeleton from "./_components/DescriptionSkeleton";
import HeroImageSkeleton from "./_components/HeroImageSkeleton";

const CourseDetailSkeleton = () => {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-8 space-y-6 bg-(--primary-bg)">
      <Skeleton width={120} height={20} className="mb-4" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <HeaderSkeleton />
          <InfoGridSkeleton />
          <HighlightsSkeleton />
          <WhatsIncludedSkeleton />
          <DescriptionSkeleton />
        </div>

        <div className="lg:col-span-1">
          <HeroImageSkeleton />
        </div>
      </div>
      {/* <CoursesLoading /> */}
    </div>
  );
};

export default CourseDetailSkeleton;
