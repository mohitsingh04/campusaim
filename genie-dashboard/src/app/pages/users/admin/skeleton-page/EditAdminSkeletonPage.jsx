import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const EditAdminSkeletonPage = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div>
                        <Skeleton height={32} width={200} />
                        <Skeleton height={16} width={180} className="mt-2" />
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <Skeleton height={40} width={100} />
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Skeleton height={24} width={140} className="mb-6" />

                <div className="space-y-6">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i}>
                                    <Skeleton height={16} width={100} className="mb-2" />
                                    <Skeleton height={40} />
                                </div>
                            ))}
                        </div>

                        {/* Bio */}
                        <div>
                            <Skeleton height={16} width={100} className="mb-2" />
                            <Skeleton height={100} />
                        </div>

                        {/* Permissions */}
                        <div>
                            <Skeleton height={16} width={100} className="mb-2" />
                            <div className="grid grid-cols-2 gap-2">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                        <Skeleton height={16} width={16} circle />
                                        <Skeleton height={16} width={100} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Skeleton height={48} width={150} />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditAdminSkeletonPage;
