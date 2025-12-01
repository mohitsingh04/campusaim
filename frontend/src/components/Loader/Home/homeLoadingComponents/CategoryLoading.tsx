import React from "react";
import Skeleton from "react-loading-skeleton";

export default function CategoryLoading() {
  const colors = ["blue", "green", "purple", "orange"];
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <div className="w-full max-w-sm md:max-w-md mx-auto mb-3 md:mb-4">
            <Skeleton height={32} className="md:h-10" />
          </div>
          <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
            <Skeleton height={20} className="md:h-6" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {colors?.map((item, index) => (
            <div
              className={`bg-${item}-50 rounded-xl md:rounded-2xl p-6 md:p-8 text-start`}
              key={index}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6">
                <Skeleton circle width="100%" height="100%" />
              </div>
              <div className="w-24 md:w-30 mb-3 md:mb-4">
                <Skeleton height={20} className="md:h-7" />
              </div>
              <div className="mb-4 md:mb-6 space-y-2">
                <Skeleton height={16} />
                <Skeleton height={16} width="80%" />
              </div>
              <div className="w-28 md:w-35">
                <Skeleton height={16} className="md:h-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
