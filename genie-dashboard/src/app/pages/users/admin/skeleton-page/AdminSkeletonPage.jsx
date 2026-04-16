import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const AdminSkeletonPage = () => {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div>
                        <Skeleton height={32} width={200} />
                        <Skeleton height={16} width={120} className="mt-2" />
                    </div>
                </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Skeleton circle height={24} width={24} />
                            </div>
                            <div className="ml-4">
                                <Skeleton height={16} width={80} />
                                <Skeleton height={24} width={40} className="mt-2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Skeleton height={40} width="100%" className="flex-1" />
                    <Skeleton height={40} width={140} />
                    <Skeleton height={40} width={200} />
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {[...Array(7)].map((_, i) => (
                                    <th key={i} className="px-6 py-3">
                                        <Skeleton height={16} width={80} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    {[...Array(7)].map((__, j) => (
                                        <td key={j} className="px-6 py-4">
                                            <Skeleton height={16} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <Skeleton height={16} width={200} />
                    <div className="flex items-center space-x-2">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} height={32} width={60} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSkeletonPage;
