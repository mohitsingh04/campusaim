import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const BlogDetailLoader = () => {
  return (
    <SkeletonTheme>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Back to Blog Link */}
              <div className="mb-6">
                <Skeleton height={20} width={100} />
              </div>

              {/* Blog Image */}
              <div className="mb-8">
                <Skeleton height={400} className="rounded-lg" />
              </div>

              {/* Category Tag */}
              <div className="mb-4">
                <Skeleton height={28} width={120} className="rounded-full" />
              </div>

              {/* Blog Title */}
              <div className="mb-6">
                <Skeleton height={40} width="90%" className="mb-2" />
                <Skeleton height={40} width="60%" />
              </div>

              {/* Author Info */}
              <div className="flex items-center mb-8">
                <Skeleton circle height={40} width={40} className="mr-3" />
                <div>
                  <Skeleton height={20} width={150} className="mb-1" />
                  <Skeleton height={16} width={100} />
                </div>
              </div>

              {/* Article Content */}
              <div className="prose max-w-none">
                {/* First paragraph */}
                <div className="mb-6">
                  <Skeleton height={20} width="100%" className="mb-2" />
                  <Skeleton height={20} width="95%" className="mb-2" />
                  <Skeleton height={20} width="85%" className="mb-2" />
                  <Skeleton height={20} width="90%" />
                </div>

                {/* Second paragraph */}
                <div className="mb-6">
                  <Skeleton height={20} width="92%" className="mb-2" />
                  <Skeleton height={20} width="88%" className="mb-2" />
                  <Skeleton height={20} width="96%" className="mb-2" />
                  <Skeleton height={20} width="80%" />
                </div>

                {/* Third paragraph */}
                <div className="mb-6">
                  <Skeleton height={20} width="85%" className="mb-2" />
                  <Skeleton height={20} width="92%" className="mb-2" />
                  <Skeleton height={20} width="88%" className="mb-2" />
                  <Skeleton height={20} width="94%" />
                </div>

                {/* Fourth paragraph */}
                <div className="mb-6">
                  <Skeleton height={20} width="98%" className="mb-2" />
                  <Skeleton height={20} width="85%" className="mb-2" />
                  <Skeleton height={20} width="90%" className="mb-2" />
                  <Skeleton height={20} width="75%" />
                </div>

                {/* Fifth paragraph */}
                <div className="mb-6">
                  <Skeleton height={20} width="87%" className="mb-2" />
                  <Skeleton height={20} width="93%" className="mb-2" />
                  <Skeleton height={20} width="89%" className="mb-2" />
                  <Skeleton height={20} width="95%" />
                </div>

                {/* Sixth paragraph */}
                <div className="mb-6">
                  <Skeleton height={20} width="91%" className="mb-2" />
                  <Skeleton height={20} width="84%" className="mb-2" />
                  <Skeleton height={20} width="97%" className="mb-2" />
                  <Skeleton height={20} width="82%" />
                </div>

                {/* Additional content blocks */}
                <div className="mb-8">
                  <Skeleton height={20} width="100%" className="mb-2" />
                  <Skeleton height={20} width="95%" className="mb-2" />
                  <Skeleton height={20} width="88%" className="mb-2" />
                  <Skeleton height={20} width="92%" className="mb-2" />
                  <Skeleton height={20} width="85%" />
                </div>

                <div className="mb-8">
                  <Skeleton height={20} width="93%" className="mb-2" />
                  <Skeleton height={20} width="87%" className="mb-2" />
                  <Skeleton height={20} width="96%" className="mb-2" />
                  <Skeleton height={20} width="89%" />
                </div>

                <div className="mb-8">
                  <Skeleton height={20} width="90%" className="mb-2" />
                  <Skeleton height={20} width="94%" className="mb-2" />
                  <Skeleton height={20} width="86%" className="mb-2" />
                  <Skeleton height={20} width="91%" />
                </div>
              </div>

              {/* Tags Section */}
              <div className="mt-12 mb-8">
                <Skeleton height={20} width={60} className="mb-4" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton height={32} width={80} className="rounded-full" />
                  <Skeleton height={32} width={100} className="rounded-full" />
                  <Skeleton height={32} width={90} className="rounded-full" />
                  <Skeleton height={32} width={110} className="rounded-full" />
                </div>
              </div>

              {/* Author Bio Section */}
              <div className="border-t pt-8">
                <div className="flex items-start space-x-4">
                  <Skeleton circle height={80} width={80} />
                  <div className="flex-1">
                    <Skeleton height={24} width={200} className="mb-2" />
                    <Skeleton height={16} width={150} className="mb-3" />
                    <Skeleton height={16} width="100%" className="mb-2" />
                    <Skeleton height={16} width="95%" className="mb-2" />
                    <Skeleton height={16} width="80%" />
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="mt-12 bg-white p-8 rounded-lg shadow-sm">
                <Skeleton height={32} width={200} className="mb-6" />

                <div className="space-y-6">
                  <div>
                    <Skeleton height={20} width={100} className="mb-2" />
                    <Skeleton height={48} width="100%" />
                  </div>

                  <div>
                    <Skeleton height={20} width={120} className="mb-2" />
                    <Skeleton height={48} width="100%" />
                  </div>

                  <div>
                    <Skeleton height={20} width={140} className="mb-2" />
                    <Skeleton height={48} width="100%" />
                  </div>

                  <div>
                    <Skeleton height={20} width={80} className="mb-2" />
                    <Skeleton height={120} width="100%" />
                  </div>

                  <Skeleton height={48} width={150} className="rounded-lg" />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <Skeleton height={28} width={150} className="mb-6" />

                {/* Recent Blog Posts */}
                <div className="space-y-6">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex space-x-3">
                      <Skeleton
                        height={60}
                        width={60}
                        className="rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1">
                        <Skeleton height={16} width="100%" className="mb-2" />
                        <Skeleton height={16} width="80%" className="mb-2" />
                        <Skeleton height={14} width="60%" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default BlogDetailLoader;
