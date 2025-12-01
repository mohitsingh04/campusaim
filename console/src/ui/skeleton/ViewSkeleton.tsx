import Skeleton from "react-loading-skeleton";

export default function ViewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="w-2/5">
          <Skeleton height={32} />
        </div>
        <div className="w-3/5 mt-2">
          <Skeleton height={20} />
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center space-x-4">
          <Skeleton circle width={80} height={80} />
          <div className="space-y-2 w-full max-w-xs">
            <div className="w-1/2 md:w-32">
              <Skeleton height={20} />
            </div>
            <div className="w-3/4">
              <Skeleton height={16} />
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="w-1/5">
                <Skeleton height={15} />
              </div>
              <div className="w-1/4">
                <Skeleton height={15} />
              </div>
            </div>
          </div>
        </div>
        <div className="w-32">
          <Skeleton height={44} borderRadius={10} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 rounded">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="w-24">
              <Skeleton height={24} />
            </div>
          ))}
      </div>

      {/* Basic Details Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-6 space-y-4">
        <div className="w-2/5">
          <Skeleton height={24} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex flex-col space-y-2">
                <div className="w-2/5">
                  <Skeleton height={15} />
                </div>
                <div className="w-3/4">
                  <Skeleton height={20} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
