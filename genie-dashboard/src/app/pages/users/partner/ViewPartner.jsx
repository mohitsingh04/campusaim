import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Pencil,
    ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API } from '../../../services/API';
import LeadsTab from '../../../components/common/LeadsTab/LeadsTab';
import Breadcrumbs from '../../../components/ui/BreadCrumb/Breadcrumbs';
import ViewUserSkeleton from '../shared/Skeleton/ViewUserSkeleton';
import Details from '../shared/Details';
import SummaryCard from '../shared/SummaryCard';
import TabsRouter from "../../../components/ui/TabsRouter";
import useActiveTab from "../../../utils/useActiveTab";
import Analytics from './components/Analytics';
import Swal from "sweetalert2";
import Comission from './components/Comission';

/* ---------------- TABS CONFIG ---------------- */
const TABS = [
    { value: "analytics", label: "Analytics" },
    { value: "details", label: "Details" },
    { value: "leads", label: "Leads" },
    { value: "comission", label: "Comission" },
];

export default function ViewPartner() {
    const { id } = useParams();

    const activeTab = useActiveTab(
        TABS.map((t) => t.value),
        "details"
    );

    const [location, setLocation] = useState(null);
    const [partnerData, setPartnerData] = useState();
    const [status, setStatus] = useState();
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const partnerRes = await API.get(`/fetch-partner/${id}`);
                const partner = partnerRes?.data;
                setPartnerData(partner);
                setStatus(partner?.status);

                if (partner?._id) {
                    const locationRes = await API.get(`/location/${partner?._id}`);
                    setLocation(locationRes?.data?.data);
                } else {
                    console.warn("Id not found in partner data");
                }

            } catch (error) {
                console.error("Error fetching partner or location:", error?.response?.data?.error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleToggle = async () => {
        if (!partnerData?._id) return;

        const nextStatus = status === "active" ? "suspended" : "active";

        const result = await Swal.fire({
            title: `${nextStatus === "active" ? "Activate" : "Suspend"} User?`,
            text: `Are you sure you want to ${nextStatus === "active" ? "activate" : "suspend"} this partner?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: nextStatus === "active" ? "#16a34a" : "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: `Yes, ${nextStatus === "active" ? "Activate" : "Suspend"}`,
            cancelButtonText: "Cancel",
            reverseButtons: true,
            focusCancel: true,
        });

        if (!result.isConfirmed) return; // user cancelled

        setLoading(true);
        try {
            const res = await API.post(`/toggle-status/${partnerData._id}`);

            if (res.data?.status) {
                setStatus(res.data.status);
                toast.success(
                    `User is now ${res.data.status === "active" ? "Active" : "Suspended"}`
                );
            } else {
                throw new Error("Invalid response");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to toggle status");
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return <ViewUserSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb Section */}
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Partner", to: "/dashboard/users/partners" },
                    { label: "Partner View" },
                ]}
                actions={[
                    {
                        label: "Edit",
                        to: `/dashboard/users/partners/edit/${id}`,
                        Icon: Pencil,
                        variant: "success",
                    },
                    {
                        label: "Back",
                        to: "/dashboard/users/partners",
                        Icon: ArrowLeft,
                        variant: "primary",
                    },
                ]}
            />

            {/* Summary Card */}
            <SummaryCard
                data={partnerData}
                location={location}
                status={status}
                loading={loading}
                onToggleStatus={handleToggle}
            />

            {/* Tabs */}
            <TabsRouter
                tabs={TABS}
                activeTab={activeTab}
            />

            {/* Tab Content */}
            {activeTab === 'analytics' && (
                <Analytics partnerId={partnerData?._id} />
            )}

            {activeTab === 'details' && (
                <Details data={partnerData} role="partner" />
            )}

            {activeTab === 'leads' && (
                <LeadsTab data={partnerData} userId={partnerData?._id} />
            )}

            {activeTab === "comission" && (
                <Comission userData={partnerData} />
            )}
        </div>
    );
}
