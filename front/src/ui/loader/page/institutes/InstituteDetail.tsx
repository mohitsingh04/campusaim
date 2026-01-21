import React from "react";
import TabLoading from "../../component/TabLoading";
import CardSkeleton from "../../ui/CardSkeleton";
import EnquiryFormSkeleton from "../../ui/EnquiryFormSkeleton";
import RelatedInstitutesSkeleton from "../../ui/RelatedInstitutesSkeleton";

const InstituteDetailLoader = () => {
  return (
    <div className="min-h-screen bg-(--secondary-bg) pb-6">
      <main className="mx-auto px-2 sm:px-8 py-0 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-17">
              <CardSkeleton />
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="max-w-6xl mx-auto">
              <TabLoading />
              <EnquiryFormSkeleton />
              <RelatedInstitutesSkeleton />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstituteDetailLoader;
