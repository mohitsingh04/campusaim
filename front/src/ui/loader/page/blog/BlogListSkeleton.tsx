"use client";

import Skeleton from "react-loading-skeleton";
import CardSkeleton from "../../ui/CardSkeleton";
import PaginationSkeleton from "../../ui/PaginationSkeleton";

const BlogListSkeleton = () => {
  return (
    <div className="mx-auto px-4 sm:px-8 py-8 bg-(--primary-bg)">
      <div className="flex flex-col md:flex-row justify-between shadow-custom p-5 rounded-custom items-center mb-8 gap-4">
        <div className="w-full md:w-1/2">
          <Skeleton height={40} className="rounded-custom" />
        </div>
        <div className="w-32">
          <Skeleton height={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <CardSkeleton key={index} />
          ))}
      </div>

      <PaginationSkeleton />
    </div>
  );
};

export default BlogListSkeleton;
