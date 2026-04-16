import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import {
    Pencil,
    ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API } from '../../../services/API';
import LeadsTab from '../../../components/common/LeadsTab/LeadsTab';
import AssignedCounselors from './components/AssignedCounselors';
import Analytics from './components/Analytics';
import Breadcrumbs from '../../../components/ui/BreadCrumb/Breadcrumbs';
import ViewUserSkeleton from '../shared/Skeleton/ViewUserSkeleton';
import Details from '../shared/Details';
import SummaryCard from '../shared/SummaryCard';
import TabsRouter from "../../../components/ui/TabsRouter";
import useActiveTab from "../../../utils/useActiveTab";
import Swal from "sweetalert2";
import Incentive from '../shared/Incentive';

/* ---------------- TABS CONFIG ---------------- */
const TABS = [
    { value: "analytics", label: "Analytics" },
    { value: "details", label: "Details" },
    { value: "assignedCounselors", label: "Assigned Counselors" },
    { value: "leads", label: "Leads" },
    { value: "incentive", label: "Incentive" },
];

export default function ViewTeamLeader() {
    const { id } = useParams();

    const activeTab = useActiveTab(
        TABS.map((t) => t.value),
        "details"
    );

    const [location, setLocation] = useState(null);
    const [teamLeaderData, setTeamLeaderData] = useState();
    const [status, setStatus] = useState();
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const teamLeaderRes = await API.get(`/fetch-team-leader/${id}`);
                const teamLeader = teamLeaderRes?.data;
                setTeamLeaderData(teamLeader);
                setStatus(teamLeader?.status);

                if (teamLeader?._id) {
                    const locationRes = await API.get(`/location/${teamLeader?._id}`);
                    setLocation(locationRes?.data?.data);
                } else {
                    console.warn("Id not found in team leader data");
                }

            } catch (error) {
                console.error("Error fetching team leader or location:", error?.response?.data?.error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleToggle = async () => {
        if (!teamLeaderData?._id) return;

        const nextStatus = status === "active" ? "suspended" : "active";

        const result = await Swal.fire({
            title: `${nextStatus === "active" ? "Activate" : "Suspend"} User?`,
            text: `Are you sure you want to ${nextStatus === "active" ? "activate" : "suspend"} this team leader?`,
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
            const res = await API.post(`/toggle-status/${teamLeaderData._id}`);

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

    function timeAgo(date) {
        const now = new Date();
        const diff = Math.floor((now - new Date(date)) / 1000);
        if (diff < 60) return `${diff} seconds ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
    }

    if (isLoading) {
        return <ViewUserSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb Section */}
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Team Leader", to: "/dashboard/users/team-leaders" },
                    { label: "Team Leader View" },
                ]}
                actions={[
                    {
                        label: "Edit",
                        to: `/dashboard/users/team-leaders/edit/${id}`,
                        Icon: Pencil,
                        variant: "success",
                    },
                    {
                        label: "Back",
                        to: "/dashboard/users/team-leaders",
                        Icon: ArrowLeft,
                        variant: "primary",
                    },
                ]}
            />

            {/* Summary Card */}
            <SummaryCard
                data={teamLeaderData}
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
                <Analytics teamLeaderId={teamLeaderData?._id} />
            )}

            {activeTab === 'details' && (
                <Details data={teamLeaderData} role="teamleader" />
            )}

            {activeTab === 'assignedCounselors' && (
                <AssignedCounselors teamLeaderData={teamLeaderData} />
            )}

            {activeTab === 'leads' && (
                <LeadsTab data={teamLeaderData} userId={teamLeaderData?._id} />
            )}

            {activeTab === "incentive" && (
                <Incentive userData={teamLeaderData} />
            )}
        </div>
    );
}
