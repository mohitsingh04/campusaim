"use client";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function InstituteDetailLoader() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-3 lg:sticky lg:top-24">
              <Skeleton height={200} className="rounded-lg shadow-sm" />
              <Skeleton width="80%" height={20} className="shadow-xs" />
              <Skeleton width="60%" height={18} className="shadow-xs" />
              <Skeleton width="70%" height={18} className="shadow-xs" />
              <div className="flex items-center justify-between pt-2 gap-2">
                <Skeleton
                  width="30%"
                  height={28}
                  className="rounded shadow-sm"
                />
                <Skeleton
                  width="30%"
                  height={28}
                  className="rounded shadow-sm"
                />
                <Skeleton
                  width="30%"
                  height={28}
                  className="rounded shadow-sm"
                />
              </div>
              <Skeleton height={45} className="rounded-lg shadow-sm" />
            </div>
          </div>

          {/* Right Section */}
          <div className="col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex flex-wrap gap-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton
                  key={i}
                  width={90}
                  height={28}
                  className="shadow-xs rounded-md"
                />
              ))}
            </div>

            {/* About */}
            <div className="space-y-3 p-4 rounded-lg shadow-sm bg-white">
              <Skeleton width="50%" height={22} />
              <Skeleton count={4} />
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 p-4 rounded-lg shadow-sm bg-white">
                <Skeleton width="60%" height={20} />
                <Skeleton count={3} />
              </div>
              <div className="space-y-3 p-4 rounded-lg shadow-sm bg-white">
                <Skeleton width="60%" height={20} />
                <Skeleton count={3} />
              </div>
            </div>

            {/* Enquiry Form */}
            <div className="space-y-4 p-4 rounded-lg shadow-sm bg-white">
              <Skeleton width="40%" height={22} />
              <Skeleton height={42} className="shadow-xs rounded-md" />
              <Skeleton height={42} className="shadow-xs rounded-md" />
              <Skeleton height={42} className="shadow-xs rounded-md" />
              <Skeleton height={42} className="shadow-xs rounded-md" />
              <Skeleton
                width="60%"
                height={48}
                className="rounded-full shadow-sm"
              />
            </div>

            {/* Related Institutes */}
            <div className="space-y-3">
              <Skeleton width="40%" height={22} />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg shadow-sm bg-white space-y-2"
                  >
                    <Skeleton height={120} className="rounded-md shadow-xs" />
                    <Skeleton width="80%" className="shadow-xs" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
