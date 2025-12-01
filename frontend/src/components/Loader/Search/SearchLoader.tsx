import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SearchLoader = () => {
  return (
    <SkeletonTheme>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {[...Array(10)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Avatar/Logo */}
                    <div className="flex-shrink-0">
                      <Skeleton circle height={48} width={48} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      {/* Title */}
                      <div className="mb-2">
                        <Skeleton
                          height={24}
                          width={`${Math.random() * 40 + 40}%`}
                        />
                      </div>

                      {/* Subtitle/Location */}
                      <div className="mb-3">
                        <Skeleton
                          height={16}
                          width={`${Math.random() * 60 + 30}%`}
                        />
                      </div>

                      {/* Additional Info */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Skeleton height={16} width={16} />
                          <Skeleton height={14} width={60} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Category Tag */}
                  <div className="flex-shrink-0 ml-4">
                    <div className="flex items-center space-x-2">
                      <Skeleton height={16} width={16} />
                      <Skeleton height={20} width={100} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex items-center justify-center space-x-2">
            <Skeleton height={40} width={80} className="rounded-lg" />
            <Skeleton height={40} width={40} className="rounded-lg" />
            <Skeleton height={40} width={40} className="rounded-lg" />
            <Skeleton height={40} width={40} className="rounded-lg" />
            <Skeleton height={40} width={40} className="rounded-lg" />
            <span className="text-gray-400">...</span>
            <Skeleton height={40} width={40} className="rounded-lg" />
            <Skeleton height={40} width={60} className="rounded-lg" />
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default SearchLoader;
