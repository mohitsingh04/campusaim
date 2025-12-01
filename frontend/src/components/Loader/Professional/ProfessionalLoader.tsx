import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProfessionalLoader = () => {
  return (
    <SkeletonTheme>
      <div className="min-h-screen bg-gray-50">
        {/* Purple Header */}
        <div className="bg-purple-600 h-48 relative">
          <div className="absolute top-4 right-4 flex space-x-2">
            <Skeleton
              height={36}
              width={60}
              className="rounded-lg"
              baseColor="#8b5cf6"
              highlightColor="#a78bfa"
            />
            <Skeleton
              height={36}
              width={70}
              className="rounded-lg"
              baseColor="#dc2626"
              highlightColor="#ef4444"
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Profile */}
            <div className="lg:col-span-2">
              {/* Profile Header Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-start space-x-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <Skeleton height={120} width={120} className="rounded-lg" />
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Skeleton height={32} width={200} />
                      <Skeleton
                        height={24}
                        width={100}
                        className="rounded-full"
                      />
                    </div>

                    <Skeleton height={20} width={120} className="mb-2" />
                    <Skeleton height={18} width={180} className="mb-4" />

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Skeleton circle height={20} width={20} />
                        <Skeleton height={16} width={16} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Skeleton height={16} width={150} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Skeleton height={16} width={120} />
                      </div>
                    </div>
                  </div>

                  {/* Edit Profile Button */}
                  <div className="flex-shrink-0">
                    <Skeleton height={40} width={120} className="rounded-lg" />
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Skeleton height={20} width={20} />
                    <Skeleton height={24} width={80} />
                  </div>
                  <Skeleton height={20} width={20} />
                </div>

                <div className="space-y-2">
                  <Skeleton height={16} width="100%" />
                  <Skeleton height={16} width="95%" />
                  <Skeleton height={16} width="88%" />
                  <Skeleton height={16} width="92%" />
                  <Skeleton height={16} width="85%" />
                </div>
              </div>

              {/* Experience Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Skeleton height={20} width={20} />
                    <Skeleton height={24} width={100} />
                    <Skeleton height={20} width={20} className="rounded-full" />
                  </div>
                  <Skeleton height={20} width={20} />
                </div>

                {/* Experience Items */}
                <div className="space-y-6">
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <Skeleton
                        height={48}
                        width={48}
                        className="rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1">
                        <Skeleton height={20} width={180} className="mb-2" />
                        <Skeleton height={16} width={100} className="mb-2" />
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Skeleton height={14} width={14} />
                            <Skeleton height={14} width={80} />
                          </div>
                          <div className="flex items-center space-x-1">
                            <Skeleton height={14} width={14} />
                            <Skeleton height={14} width={120} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Skeleton height={20} width={20} />
                    <Skeleton height={24} width={90} />
                    <Skeleton height={20} width={20} className="rounded-full" />
                  </div>
                  <Skeleton height={20} width={20} />
                </div>

                <div className="flex items-start space-x-4">
                  <Skeleton
                    height={48}
                    width={48}
                    className="rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1">
                    <Skeleton height={20} width={100} className="mb-2" />
                    <Skeleton height={16} width={60} className="mb-2" />
                    <div className="flex items-center space-x-1">
                      <Skeleton height={14} width={14} />
                      <Skeleton height={14} width={120} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Skeleton height={20} width={20} />
                    <Skeleton height={24} width={60} />
                    <Skeleton height={20} width={20} className="rounded-full" />
                  </div>
                  <Skeleton height={20} width={20} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Skeleton height={32} width={60} className="rounded-full" />
                </div>
              </div>

              {/* Languages Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Skeleton height={20} width={20} />
                    <Skeleton height={24} width={90} />
                    <Skeleton height={20} width={20} className="rounded-full" />
                  </div>
                  <Skeleton height={20} width={20} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Skeleton height={32} width={50} className="rounded-full" />
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              {/* Resume/CV Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Skeleton height={20} width={20} />
                  <Skeleton height={20} width={100} />
                </div>

                <div className="space-y-3">
                  <Skeleton height={40} width="100%" className="rounded-lg" />
                  <Skeleton height={40} width="100%" className="rounded-lg" />
                </div>
              </div>

              {/* Site Under Construction Notice */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border-l-4 border-red-500">
                <div className="flex items-start space-x-3">
                  <Skeleton height={20} width={20} />
                  <div className="flex-1">
                    <Skeleton height={16} width={150} className="mb-1" />
                    <Skeleton height={14} width={200} />
                  </div>
                  <Skeleton height={16} width={16} />
                </div>
              </div>

              {/* Profile Score */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Skeleton height={20} width={20} />
                  <Skeleton height={20} width={120} />
                </div>

                <div className="text-center">
                  <Skeleton
                    circle
                    height={120}
                    width={120}
                    className="mx-auto mb-4"
                  />
                  <Skeleton height={16} width={150} className="mx-auto mb-4" />
                  <Skeleton height={40} width="100%" className="rounded-lg" />
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Skeleton height={20} width={20} />
                  <Skeleton height={20} width={100} />
                </div>

                <div className="space-y-4">
                  {/* Email */}
                  <div className="flex items-center space-x-3">
                    <Skeleton
                      height={40}
                      width={40}
                      className="rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <Skeleton height={14} width={50} className="mb-1" />
                      <Skeleton height={16} width={150} />
                    </div>
                  </div>

                  {/* Primary Phone */}
                  <div className="flex items-center space-x-3">
                    <Skeleton
                      height={40}
                      width={40}
                      className="rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <Skeleton height={14} width={100} className="mb-1" />
                      <Skeleton height={16} width={120} />
                    </div>
                  </div>

                  {/* Alternate Phone */}
                  <div className="flex items-center space-x-3">
                    <Skeleton
                      height={40}
                      width={40}
                      className="rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <Skeleton height={14} width={120} className="mb-1" />
                      <Skeleton height={16} width={120} />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center space-x-3">
                    <Skeleton
                      height={40}
                      width={40}
                      className="rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <Skeleton height={14} width={70} className="mb-1" />
                      <Skeleton height={16} width={180} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default ProfessionalLoader;
