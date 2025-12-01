import Skeleton from "react-loading-skeleton";

export default function LegalSkeleton() {
  return (
    <div className="p-4 space-y-6">
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
      <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 space-y-4">
        {/* Card Title */}
        <Skeleton width={150} height={22} />
        <Skeleton width={180} height={16} />

        {/* Editor Content Area */}
        <Skeleton height={200} className="w-full" />

        {/* Save Button */}
        <div className="pt-2">
          <Skeleton width={150} height={40} borderRadius={8} />
        </div>
      </div>
    </div>
  );
}
