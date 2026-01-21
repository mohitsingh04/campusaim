"use client";

import BookingSidebarSkeleton from "./_components/BookingSidebarSkeleton";
import HeroSkeleton from "./_components/HeroSkeleton";
import HighlightsSkeleton from "./_components/HighlightSkeleton";
import InfoGridSkeleton from "./_components/InfoGridSkeleton";
import PartnersSkeleton from "./_components/PartnersSkeleton";

const EventPageSkeleton = () => {
  return (
    <div className="mx-auto px-4 sm:px-8  py-8 bg-(--primary-bg)">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          <HeroSkeleton />
          <InfoGridSkeleton />
          <HighlightsSkeleton />
          <PartnersSkeleton />
        </div>
        <div className="lg:col-span-1">
          <BookingSidebarSkeleton />
        </div>
      </div>
    </div>
  );
};

export default EventPageSkeleton;
