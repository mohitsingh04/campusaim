'use client'

import Skeleton from 'react-loading-skeleton';

const EnquiryFormSkeleton = () => {
  return (
    <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom w-full mt-4">

      <div className="mb-6">
        <Skeleton width={180} height={28} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex flex-col">
            <Skeleton width={100} height={14} />
            <Skeleton height={25} className='rounded-custom' />
          </div>
        ))}
      </div>

      <Skeleton height={35} className='rounded-custom w-full' />

    </div>
  );
};

export default EnquiryFormSkeleton;