import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import CardLoading from "../LoadingComponents/CardLoading";

const PropertiesLoader: React.FC = () => {
  return (
    <SkeletonTheme>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-4">
                <Skeleton height={16} />
              </div>
              <div className="w-2 h-4">
                <Skeleton height={16} />
              </div>
              <div className="w-20 h-4">
                <Skeleton height={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="w-full lg:w-80 lg:flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                {/* Filters Header */}
                <div className="flex items-center mb-6">
                  <div className="w-4 h-4 mr-2">
                    <Skeleton width="100%" height="100%" />
                  </div>
                  <div className="w-16 h-5">
                    <Skeleton height={20} />
                  </div>
                </div>

                {/* Country Filter */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-5">
                      <Skeleton height={20} />
                    </div>
                    <div className="w-4 h-4">
                      <Skeleton width="100%" height="100%" />
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="mb-4">
                    <Skeleton height={40} />
                  </div>

                  {/* Country Options */}
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="w-4 h-4 mr-3">
                            <Skeleton width="100%" height="100%" />
                          </div>
                          <div className="w-16 h-4">
                            <Skeleton height={16} />
                          </div>
                        </div>
                        <div className="w-6 h-4">
                          <Skeleton height={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Course Name Filter */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-24 h-5">
                      <Skeleton height={20} />
                    </div>
                    <div className="w-4 h-4">
                      <Skeleton width="100%" height="100%" />
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="mb-4">
                    <Skeleton height={40} />
                  </div>

                  {/* Course Options */}
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="w-4 h-4 mr-3">
                            <Skeleton width="100%" height="100%" />
                          </div>
                          <div className={`w-${20 + index * 8} h-4`}>
                            <Skeleton height={16} />
                          </div>
                        </div>
                        <div className="w-6 h-4">
                          <Skeleton height={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <div className="w-48 h-6 mb-2">
                    <Skeleton height={24} />
                  </div>
                  <div className="w-32 h-4">
                    <Skeleton height={16} />
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                  <div className="w-8 h-8">
                    <Skeleton width="100%" height="100%" />
                  </div>
                  <div className="w-8 h-8">
                    <Skeleton width="100%" height="100%" />
                  </div>
                </div>
              </div>

              {/* Institute Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <CardLoading key={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default PropertiesLoader;
