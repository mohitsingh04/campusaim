import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowLeft, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import ViewAdminSkeletonPage from './skeleton-page/ViewAdminSkeletonPage';
import UserList from './admin-components/UserList';
import Analytics from './admin-components/Analytics';
import Details from './admin-components/Details';
import { CampusaimAPI } from '../../../services/API';
import Breadcrumbs from '../../../components/ui/BreadCrumb/Breadcrumbs';
import AdminProfileCard from './admin-components/AdminProfileCard';

// ========================= API =========================
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
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();

    const tabs = useMemo(() => [
        { id: "analytics", label: "Analytics" },
        { id: "details", label: "Details" },
        { id: "partners", label: "Partners" },
        { id: "teamleader", label: "Team Leaders" },
        { id: "counselors", label: "Counselors" },
    ], []);

    // ✅ Get tab from URL
    const initialTab = searchParams.get("tab");
    const isValidTab = tabs.some(t => t.id === initialTab);

    const [activeTab, setActiveTab] = useState(isValidTab ? initialTab : "details");

    // ========================= SYNC URL <-> STATE =========================

    // Update state when URL changes
    useEffect(() => {
        const tabFromUrl = searchParams.get("tab");
        if (tabFromUrl && tabs.some(t => t.id === tabFromUrl)) {
            setActiveTab(tabFromUrl);
        }
    }, [searchParams, tabs]);

    // Update URL when tab changes
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId }); // ✅ clean replace
    };

    // ========================= DATA =========================

    const { data: adminData, isLoading, isError } = useQuery({
        queryKey: ['admin-overview', id],
        queryFn: () => fetchAdminOverview(id),
        enabled: !!id,
        staleTime: 300000,
    });

    const toggleMutation = useMutation({
        mutationFn: () => toggleAdminStatus(id),
        onSuccess: (res) => {
            toast.success(`Admin is now ${res.status}`);
            queryClient.setQueryData(["admin-overview", id], (old) => {
                if (!old) return old;

                return {
                    ...old,
                    admin: {
                        ...old.admin,
                        status: res.status,
                    },
                };
            });
            queryClient.invalidateQueries({ queryKey: ["admins"] });
        },
        onError: () => toast.error("Failed to toggle status"),
    });

    const handleToggleStatus = async () => {
        if (!adminData?.admin?._id || toggleMutation.isPending) return;

        const currentStatus = adminData?.admin?.status;
        const nextStatus =
            currentStatus === "Active" ? "Suspended" : "Active";

        const result = await Swal.fire({
            title: `${nextStatus === "Active" ? "Activate" : "Suspend"} User?`,
            text: `Are you sure you want to ${nextStatus === "Active" ? "activate" : "suspend"} this admin?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor:
                nextStatus === "Active" ? "#16a34a" : "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: `Yes, ${nextStatus === "Active" ? "Activate" : "Suspend"}`,
            cancelButtonText: "Cancel",
            reverseButtons: true,
            focusCancel: true,
        });

        if (!result.isConfirmed) return;

        toggleMutation.mutate();
    };

    const fullAddress = useMemo(() => {
        if (!adminData?.location) return "N/A";
        const { address, pincode, city, state, country } = adminData.location;
        return [address, pincode, city, state, country].filter(Boolean).join(", ");
    }, [adminData?.location]);

    if (isLoading) return <ViewAdminSkeletonPage />;
    if (isError) return <div className="p-6 text-center text-red-500">Error loading admin data.</div>;

    const TAB_COMPONENTS = {
        analytics: <Analytics adminId={adminData?.admin?._id} />,
        details: <Details adminData={adminData?.admin} />,
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
                    { label: adminData?.admin?.name || "Admin", active: true },
                ]}
                actions={[
                    { label: "Edit", to: `/dashboard/admins/edit/${adminData?.admin?._id}`, Icon: Pencil, variant: "success" },
                    { label: "Back", to: "/dashboard/admins", Icon: ArrowLeft, variant: "primary" },
                ]}
            />

            <AdminProfileCard adminData={adminData?.admin} toggleMutation={toggleMutation} onToggleStatus={handleToggleStatus} fullAddress={fullAddress} />

            <div className="border-b border-gray-200">
                <div className="overflow-x-auto">
                    <nav className="-mb-px flex gap-6 min-w-max px-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)} // ✅ use handler
                                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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