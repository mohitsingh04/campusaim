import React from "react";
import Skeleton from "react-loading-skeleton";

export default function BannerLoading() {
  return (
    <section className="relative bg-white min-h-[500px] md:min-h-[600px] overflow-hidden">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="relative flex items-center justify-center">
          <div className="hidden xl:flex flex-col space-y-4 absolute left-0 top-1/2 transform -translate-y-1/2">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="w-12 h-12 lg:w-14 lg:h-14">
                <Skeleton circle width="100%" height="100%" />
              </div>
            ))}
          </div>

          <div className="w-full max-w-4xl text-center">
            {/* Logo */}
            <div className="mb-6 md:mb-8">
              <div className="w-40 sm:w-48 md:w-52 mx-auto">
                <Skeleton height={32} className="md:h-10" />
              </div>
            </div>

            {/* Main Heading */}
            <div className="mb-6 md:mb-8 space-y-2">
              <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
                <Skeleton height={36} className="md:h-12" />
              </div>
              <div className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto">
                <Skeleton height={36} className="md:h-12" />
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8 md:mb-12">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <Skeleton height={48} className="md:h-14" />
                </div>
                <div className="w-full sm:w-28 md:w-32">
                  <Skeleton height={48} className="md:h-14" />
                </div>
              </div>
            </div>

            {/* Category Buttons */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="w-24 sm:w-28 md:w-32">
                <Skeleton height={32} className="md:h-10" />
              </div>
              <div className="w-32 sm:w-36 md:w-40">
                <Skeleton height={32} className="md:h-10" />
              </div>
              <div className="w-24 sm:w-28 md:w-32">
                <Skeleton height={32} className="md:h-10" />
              </div>
              <div className="w-28 sm:w-32 md:w-36">
                <Skeleton height={32} className="md:h-10" />
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
              <div className="w-20 mx-auto sm:mx-0">
                <Skeleton height={24} className="md:h-8" />
              </div>
              <div className="w-24 mx-auto sm:mx-0">
                <Skeleton height={24} className="md:h-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
