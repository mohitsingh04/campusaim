import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProfileLoader: React.FC = () => {
  return (
    <SkeletonTheme>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                {/* Profile Picture */}
                <div className="w-32 h-32 rounded-full overflow-hidden">
                  <Skeleton height="100%" width="100%" circle />
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="mb-2">
                    <Skeleton width={100} height={16} />
                  </div>
                  <div className="mb-3">
                    <Skeleton width={120} height={24} />
                  </div>
                  <div className="inline-block">
                    <Skeleton width={130} height={20} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Skeleton width={120} height={44} />
                <Skeleton width={160} height={44} />
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <div className="mb-6">
              <Skeleton width={180} height={28} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Skeleton width={20} height={20} />
                </div>
                <div className="flex-1">
                  <div className="mb-1">
                    <Skeleton width={70} height={16} />
                  </div>
                  <Skeleton width={100} height={20} />
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Skeleton width={20} height={20} />
                </div>
                <div className="flex-1">
                  <div className="mb-1">
                    <Skeleton width={40} height={16} />
                  </div>
                  <Skeleton width={180} height={20} />
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Skeleton width={20} height={20} />
                </div>
                <div className="flex-1">
                  <div className="mb-1">
                    <Skeleton width={50} height={16} />
                  </div>
                  <Skeleton width={140} height={20} />
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Skeleton width={20} height={20} />
                </div>
                <div className="flex-1">
                  <div className="mb-1">
                    <Skeleton width={60} height={16} />
                  </div>
                  <Skeleton width={250} height={20} />
                  <Skeleton width={40} height={20} />
                </div>
              </div>

              {/* Alt Phone */}
              <div className="flex items-center space-x-4 md:col-start-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Skeleton width={20} height={20} />
                </div>
                <div className="flex-1">
                  <div className="mb-1">
                    <Skeleton width={70} height={16} />
                  </div>
                  <Skeleton width={140} height={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="mb-6">
              <Skeleton width={160} height={28} />
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Skeleton width={150} height={48} />
              <Skeleton width={120} height={48} />
              <Skeleton width={140} height={48} />
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default ProfileLoader;
