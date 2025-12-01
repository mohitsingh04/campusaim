import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import BannerLoading from "./homeLoadingComponents/bannerLoading";
import CategoryLoading from "./homeLoadingComponents/CategoryLoading";
import CardLoading from "../LoadingComponents/CardLoading";

const HomeLoading: React.FC = () => {
  return (
    <SkeletonTheme>
      <div className="min-h-screen bg-white">
        <BannerLoading />
        <CategoryLoading />
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <div className="w-full max-w-xs md:max-w-sm mx-auto mb-3 md:mb-4">
                <Skeleton height={32} className="md:h-10" />
              </div>
              <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
                <Skeleton height={20} className="md:h-6" />
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[0, 1, 2].map((index) => (
                  <CardLoading key={index} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <div className="w-full max-w-xs md:max-w-sm mx-auto mb-3 md:mb-4">
                <Skeleton height={32} className="md:h-10" />
              </div>
              <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
                <Skeleton height={20} className="md:h-6" />
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[0, 1, 2].map((index) => (
                  <CardLoading key={index} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <div className="w-full max-w-xs md:max-w-sm mx-auto mb-3 md:mb-4">
                <Skeleton height={32} className="md:h-10" />
              </div>
              <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
                <Skeleton height={20} className="md:h-6" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div className="w-full h-32 md:h-40 mb-4" key={index}>
                  <Skeleton width="100%" height="100%" />
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <div className="w-full max-w-xs md:max-w-sm mx-auto mb-3 md:mb-4">
                <Skeleton height={32} className="md:h-10" />
              </div>
              <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
                <Skeleton height={20} className="md:h-6" />
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <CardLoading key={index} />
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              <div className="order-2 lg:order-1">
                <div className="mb-6 md:mb-8">
                  <div className="w-full max-w-sm md:max-w-md">
                    <Skeleton height={32} className="md:h-10" />
                  </div>
                </div>
                <div className="space-y-4 md:space-y-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 pb-4 md:pb-6"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 mr-4">
                          <Skeleton
                            height={18}
                            className="md:h-5"
                            width={`${Math.random() * 30 + 60}%`}
                          />
                        </div>
                        <div className="w-5 h-5 md:w-6 md:h-6">
                          <Skeleton width="100%" height="100%" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                <div className="w-full max-w-md lg:max-w-lg">
                  <div className="relative">
                    <div className="w-full h-64 md:h-80 lg:h-96">
                      <Skeleton width="100%" height="100%" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SkeletonTheme>
  );
};

export default HomeLoading;
