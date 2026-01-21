"use client";

import "react-loading-skeleton/dist/skeleton.css";
import FilterSidebarSkeleton from "../../ui/FilterSidebarSkeleton";
import ContentHeaderSkeleton from "../../ui/ContentHeaderSkeleton";
import CardSkeleton from "../../ui/CardSkeleton";
import PaginationSkeleton from "../../ui/PaginationSkeleton";

const InsitutesLoader = () => {
  return (
    <>
      <div className="px-2 sm:px-8 py-6 bg-(--primary-bg)">
        <div className="flex flex-col lg:flex-row gap-6 relative items-start">
          <FilterSidebarSkeleton />

          <div className="w-full lg:w-3/4">
            <ContentHeaderSkeleton />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <CardSkeleton key={index} />
                ))}
            </div>

            <PaginationSkeleton />
          </div>
        </div>
      </div>
    </>
  );
};

export default InsitutesLoader;
