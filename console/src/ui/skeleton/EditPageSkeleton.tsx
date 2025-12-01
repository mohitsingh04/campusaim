import Skeleton from "react-loading-skeleton";

export default function EditSkeleton() {
  return (
    <div className="p-4 space-y-6">
      {/* Page Title */}
      <Skeleton width={140} height={28} />

      {/* Breadcrumb */}
      <div className="flex space-x-2">
        <Skeleton width={80} height={16} />
        <Skeleton width={10} height={16} />
        <Skeleton width={60} height={16} />
        <Skeleton width={10} height={16} />
        <Skeleton width={40} height={16} />
      </div>

      {/* Card */}
      <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 space-y-6">
        {/* Card Title */}
        <Skeleton width={180} height={22} />

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton width={120} height={16} />
              <Skeleton height={40} />
            </div>
          ))}
        </div>

        {/* Verified Toggle */}
        <div className="space-y-2">
          <Skeleton width={120} height={16} />
          <Skeleton circle height={24} width={24} />
        </div>

        <div className="space-y-2">
          <Skeleton width={140} height={16} />
          <Skeleton height={120} />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <Skeleton width={140} height={40} borderRadius={8} />
          <Skeleton width={100} height={40} borderRadius={8} />
        </div>
      </div>
    </div>
  );
}
