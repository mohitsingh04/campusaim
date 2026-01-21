"use client";

import Skeleton from "react-loading-skeleton";
import EnquiryFormSkeleton from "../../ui/EnquiryFormSkeleton";
import SidebarSkeleton from "./_components/SidebarSkeleton";
import FeaturedSkeleton from "./_components/FeaturedSkeleton";

const BlogDetailSkeleton = () => {
  return (
    <div>
      <div className="mx-auto sm:px-8 px-4 py-8 bg-(--primary-bg)">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8  space-y-6">
            <FeaturedSkeleton />
            <EnquiryFormSkeleton />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="p-5 rounded-custom shadow-custom ">
              <div className="mb-4">
                <Skeleton width={100} height={24} />
              </div>
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <SidebarSkeleton key={i} />
                ))}
            </div>

            <div className="p-5 rounded-custom shadow-custom sticky top-20">
              <div className="mb-4">
                <Skeleton width={120} height={24} />
              </div>
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <SidebarSkeleton key={i} />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailSkeleton;
