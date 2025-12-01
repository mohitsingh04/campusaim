import React from "react";
import Skeleton from "react-loading-skeleton";
import CardLoading from "../LoadingComponents/CardLoading";

export default function BlogLoader() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <div className="w-full mx-auto">
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
  );
}
