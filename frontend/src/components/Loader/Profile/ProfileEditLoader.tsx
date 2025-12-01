import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProfileEditLoader = () => {
  return (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Form Fields */}
            <div className="space-y-6">
              {/* Username Field */}
              <div>
                <Skeleton height={20} width={80} className="mb-2" />
                <div className="relative">
                  <Skeleton height={48} width="100%" className="rounded-lg" />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Skeleton height={20} width={20} />
                  </div>
                </div>
              </div>

              {/* Name Field */}
              <div>
                <Skeleton height={20} width={60} className="mb-2" />
                <div className="relative">
                  <Skeleton height={48} width="100%" className="rounded-lg" />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Skeleton height={20} width={20} />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <Skeleton height={20} width={50} className="mb-2" />
                <div className="relative">
                  <Skeleton height={48} width="100%" className="rounded-lg" />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Skeleton height={20} width={20} />
                  </div>
                </div>
              </div>
              <div>
                <Skeleton height={20} width={50} className="mb-2" />
                <div className="relative">
                  <Skeleton height={48} width="100%" className="rounded-lg" />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Skeleton height={20} width={20} />
                  </div>
                </div>
              </div>
              <div>
                <Skeleton height={20} width={50} className="mb-2" />
                <div className="relative">
                  <Skeleton height={48} width="100%" className="rounded-lg" />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Skeleton height={20} width={20} />
                  </div>
                </div>
              </div>

              {/* Address and Pincode Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Skeleton height={20} width={70} className="mb-2" />
                  <div className="relative">
                    <Skeleton height={48} width="100%" className="rounded-lg" />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Skeleton height={20} width={20} />
                    </div>
                  </div>
                </div>
                <div>
                  <Skeleton height={20} width={70} className="mb-2" />
                  <div className="relative">
                    <Skeleton height={48} width="100%" className="rounded-lg" />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Skeleton height={20} width={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Country Field */}
              <div>
                <Skeleton height={20} width={70} className="mb-2" />
                <Skeleton height={48} width="100%" className="rounded-lg" />
              </div>

              {/* State and City Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Skeleton height={20} width={50} className="mb-2" />
                  <Skeleton height={48} width="100%" className="rounded-lg" />
                </div>
                <div>
                  <Skeleton height={20} width={40} className="mb-2" />
                  <Skeleton height={48} width="100%" className="rounded-lg" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6">
                <Skeleton
                  height={48}
                  width={100}
                  className="rounded-lg"
                  baseColor="#8b5cf6"
                  highlightColor="#a78bfa"
                />
                <Skeleton
                  height={48}
                  width={100}
                  className="rounded-lg"
                  baseColor="#dc2626"
                  highlightColor="#ef4444"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default ProfileEditLoader;
