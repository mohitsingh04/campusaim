import Skeleton from "react-loading-skeleton";

const RelatedInstitutesSkeleton = () => {
  return (
    <div className="bg-(--primary-bg) rounded-custom p-5 shadow-custom mt-4">
      <div className="flex items-center gap-3 mb-5">
        <Skeleton width={10} height={24} />
        <Skeleton width={250} height={24} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="relative h-54 rounded-custom overflow-hidden shadow-custom "
          >
            <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col justify-end">
              <Skeleton width="85%" height={24} className="mb-2" />
              <Skeleton width="65%" height={16} className="mb-2" />
              <Skeleton width="30%" height={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedInstitutesSkeleton;
