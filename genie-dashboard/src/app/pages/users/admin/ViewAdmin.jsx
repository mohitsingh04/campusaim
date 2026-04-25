import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowLeft, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import ViewAdminSkeletonPage from './skeleton-page/ViewAdminSkeletonPage';
import UserList from './admin-components/UserList';
import Analytics from './admin-components/Analytics';
import Details from './admin-components/Details';
import { API, CampusaimAPI } from '../../../services/API';
import Breadcrumbs from '../../../components/ui/BreadCrumb/Breadcrumbs';
import AdminProfileCard from './admin-components/AdminProfileCard';

// ========================= API FUNCTIONS =========================

const fetchAdminOverview = async (id) => {
    const { data } = await CampusaimAPI.get(`/fetch-admins/${id}`);
    return data?.data;
};

const toggleAdminStatus = async (id) => {
    const { data } = await CampusaimAPI.post(`/toggle-status/${id}`);
    return data;
};

// ========================= COMPONENT =========================

export default function ViewAdmin() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('details');

    // ========================= DATA FETCHING =========================

    const { data: adminData, isLoading, isError } = useQuery({
        queryKey: ['admin-overview', id],
        queryFn: () => fetchAdminOverview(id),
        enabled: !!id,
        staleTime: 300000, // 5 minutes
    });

    const toggleMutation = useMutation({
        mutationFn: () => toggleAdminStatus(id),
        onSuccess: (res) => {
            toast.success(`User is now ${res.status}`);
            queryClient.setQueryData(['admin-overview', id], (old) =>
                old ? { ...old, status: res.status } : old
            );
            queryClient.invalidateQueries({ queryKey: ["admins"] });
        },
        onError: () => toast.error("Failed to toggle status"),
    });

    // ========================= MEMOIZED LOGIC =========================

    const fullAddress = useMemo(() => {
        if (!adminData?.location) return "N/A";
        const { address, pincode, city, state, country } = adminData.location;
        return [address, pincode, city, state, country].filter(Boolean).join(", ");
    }, [adminData?.location]);

    const tabs = useMemo(() => [
        { id: "analytics", label: "Analytics" },
        { id: "details", label: "Details" },
        { id: "partners", label: "Partners" },
        { id: "teamleader", label: "Team Leaders" },
        { id: "counselors", label: "Counselors" },
    ], []);

    // ========================= RENDER LOGIC =========================

    if (isLoading) return <ViewAdminSkeletonPage />;
    if (isError) return <div className="p-6 text-center text-red-500">Error loading admin data.</div>;

    const TAB_COMPONENTS = {
        analytics: <Analytics adminId={adminData?._id} />,
        details: <Details adminData={adminData} />,
        partners: <UserList users={adminData?.partners || []} role="partner" />,
        teamleader: <UserList users={adminData?.teamleaders || []} role="teamleader" />,
        counselors: <UserList users={adminData?.counselors || []} role="counselor" />,
    };

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Admin", to: "/dashboard/admins" },
                    { label: "View", to: "/dashboard/admins" },
                    { label: adminData?.name || "Admin", active: true },
                ]}
                actions={[
                    { label: "Edit", to: `/dashboard/admins/edit/${adminData?._id}`, Icon: Pencil, variant: "success" },
                    { label: "Back", to: "/dashboard/admins", Icon: ArrowLeft, variant: "primary" },
                ]}
            />

            {/* Admin Profile Card */}
            <AdminProfileCard adminData={adminData} toggleMutation={toggleMutation} fullAddress={fullAddress} />

            <div className="border-b border-gray-200">
                <div className="overflow-x-auto">
                    <nav className="-mb-px flex gap-6 min-w-max px-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="mt-4">
                {TAB_COMPONENTS[activeTab]}
            </div>
        </div>
    );
}