import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CompareLoader = () => {
  return (
    <SkeletonTheme>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Skeleton height={32} width={120} />
                <div className="flex items-center space-x-2">
                  <Skeleton height={20} width={80} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Basic Comparison Section */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            {/* Section Header */}
            <div className="bg-gray-50 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
              <Skeleton height={24} width={200} />
              <Skeleton height={20} width={100} />
            </div>

            {/* Comparison Cards */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="text-center">
                    {/* Studio Image */}
                    <div className="mb-4">
                      <Skeleton
                        height={120}
                        width={180}
                        className="mx-auto rounded-lg"
                      />
                    </div>

                    {/* Studio Name */}
                    <Skeleton
                      height={24}
                      width={150}
                      className="mx-auto mb-2"
                    />

                    {/* Location */}
                    <Skeleton
                      height={16}
                      width={120}
                      className="mx-auto mb-4"
                    />
                  </div>
                ))}
              </div>

              {/* Comparison Table */}
              <div className="space-y-4">
                {/* Table Rows */}
                {[...Array(8)].map((_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100"
                  >
                    <div className="flex items-center">
                      <Skeleton height={20} width={120} />
                    </div>
                    <div className="text-center">
                      <Skeleton
                        height={32}
                        width={100}
                        className="mx-auto rounded-full"
                      />
                    </div>
                    <div className="text-center">
                      <Skeleton
                        height={32}
                        width={100}
                        className="mx-auto rounded-full"
                      />
                    </div>
                    <div className="text-center">
                      <Skeleton
                        height={32}
                        width={100}
                        className="mx-auto rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Course Comparison Section */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="bg-gray-50 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
              <Skeleton height={24} width={200} />
              <Skeleton height={20} width={100} />
            </div>

            <div className="p-6">
              {/* Course Selection */}
              <div className="mb-6">
                <Skeleton height={16} width={150} className="mb-2" />
                <Skeleton height={40} width={300} className="rounded-lg" />
              </div>

              {/* Course Details */}
              <div className="space-y-6">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 gap-4 py-4 border-b border-gray-100"
                  >
                    <div className="flex items-center">
                      <Skeleton height={20} width={100} />
                    </div>
                    <div className="text-center">
                      <Skeleton height={20} width={80} />
                    </div>
                    <div className="text-center">
                      <Skeleton height={20} width={80} />
                    </div>
                    <div className="text-center">
                      <Skeleton height={20} width={80} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Yogaprema Section */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Skeleton height={24} width={120} />
                  <Skeleton height={16} width={80} />
                </div>
                <div className="mt-4 grid grid-cols-4 gap-4">
                  <Skeleton height={16} width={80} />
                  <Skeleton height={16} width={100} />
                  <Skeleton height={16} width={100} />
                  <Skeleton height={16} width={100} />
                </div>
              </div>
            </div>
          </div>

          {/* Amenities Comparison Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="bg-gray-50 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
              <Skeleton height={24} width={220} />
              <Skeleton height={20} width={100} />
            </div>

            <div className="p-6">
              {/* Amenities Header */}
              <div className="grid grid-cols-4 gap-4 mb-6 pb-4 border-b-2 border-gray-200">
                <div>
                  <Skeleton height={20} width={80} />
                </div>
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="text-center">
                    <Skeleton
                      height={20}
                      width={120}
                      className="mx-auto mb-2"
                    />
                    <Skeleton height={16} width={100} className="mx-auto" />
                  </div>
                ))}
              </div>

              {/* Amenities List */}
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 gap-4 py-2 hover:bg-gray-50 rounded"
                  >
                    <div className="flex items-center">
                      <Skeleton height={16} width={16} className="mr-2" />
                      <Skeleton
                        height={16}
                        width={`${Math.random() * 100 + 80}px`}
                      />
                    </div>
                    {[...Array(3)].map((_, colIndex) => (
                      <div key={colIndex} className="flex justify-center">
                        <Skeleton height={20} width={20} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default CompareLoader;
