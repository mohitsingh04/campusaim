import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Pencil, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { API, CampusaimAPI } from "../../../services/API";

import LeadsTab from "../../../components/common/LeadsTab/LeadsTab";
import Breadcrumbs from "../../../components/ui/BreadCrumb/Breadcrumbs";
import Analytics from "./components/Analytics";
import TabsRouter from "../../../components/ui/TabsRouter";
import AssignGoal from "./components/AssignGoal";
import AssignedGoal from "./components/AssignedGoal";
import Details from "../shared/Details";
import SummaryCard from "../shared/SummaryCard";
import useActiveTab from "../../../utils/useActiveTab";
import ViewUserSkeleton from "../shared/Skeleton/ViewUserSkeleton";
import Swal from "sweetalert2";
import Incentive from "../shared/Incentive";

/* ---------------- TABS CONFIG ---------------- */

const TABS = [
    { value: "analytics", label: "Analytics" },
    { value: "details", label: "Details" },
    { value: "leads", label: "Leads" },
    { value: "assignGoal", label: "Assign Goal" },
    { value: "assignedGoal", label: "Assigned Goal" },
    { value: "incentive", label: "Incentive" },
];

export default function ViewCounselor() {
    const { id } = useParams();

    const activeTab = useActiveTab(
        TABS.map((t) => t.value),
        "details"
    );

    const [location, setLocation] = useState(null);
    const [counselorData, setCounselorData] = useState();
    const [status, setStatus] = useState();
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    /* ---------------- FETCH DATA ---------------- */

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            try {
                const counselorRes = await CampusaimAPI.get(`/fetch-counselor/${id}`);
                const counselor = counselorRes?.data?.data;

                setCounselorData(counselor);
                setStatus(counselor?.status);

                if (counselor?._id) {
                    const locationRes = await API.get(`/location/${counselor._id}`);
                    setLocation(locationRes?.data?.data);
                }
            } catch (error) {
                console.error(
                    "Error fetching counselor:",
                    error?.response?.data?.error || error?.message
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    /* ---------------- STATUS TOGGLE ---------------- */

    const handleToggle = async () => {
        if (!counselorData?._id || loading) return; // guard: prevent double click

        const nextStatus = status === "active" ? "suspended" : "active";

        const result = await Swal.fire({
            title: `${nextStatus === "active" ? "Activate" : "Suspend"} User?`,
            text: `Are you sure you want to ${nextStatus === "active" ? "activate" : "suspend"} this counselor?`,
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
            const res = await CampusaimAPI.post(`/toggle-status/${counselorData._id}`);

            if (res.data?.status) {
                setStatus(res.data.status);

                toast.success(
                    `User is now ${res.data.status === "Active" ? "Active" : "Suspended"}`
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

    /* ---------------- LOADING ---------------- */

    if (isLoading) {
        return <ViewUserSkeleton />;
    }

    return (
        <div className="space-y-6">

            {/* ---------------- BREADCRUMBS ---------------- */}

            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Counselor", to: "/dashboard/users/counselors" },
                    { label: "View" },
                ]}
                actions={[
                    {
                        label: "Edit",
                        to: `/dashboard/users/counselors/edit/${id}`,
                        Icon: Pencil,
                        variant: "success",
                    },
                    {
                        label: "Back",
                        to: "/dashboard/users/counselors",
                        Icon: ArrowLeft,
                        variant: "primary",
                    },
                ]}
            />

            {/* ---------------- SUMMARY CARD ---------------- */}

            <SummaryCard
                data={counselorData}
                location={location}
                status={status}
                loading={loading}
                onToggleStatus={handleToggle}
            />

            {/* ---------------- TABS ---------------- */}

            <TabsRouter
                tabs={TABS}
                activeTab={activeTab}
            />

            {/* ---------------- TAB CONTENT ---------------- */}

            {activeTab === "analytics" && (
                <Analytics counselorId={counselorData?._id} />
            )}

            {activeTab === "details" && (
                <Details data={counselorData} role="counselor" />
            )}

            {activeTab === "leads" && (
                <LeadsTab data={counselorData} userId={counselorData?._id} />
            )}

            {activeTab === "assignGoal" && (
                <AssignGoal counselorData={counselorData} />
            )}

            {activeTab === "assignedGoal" && (
                <AssignedGoal counselorId={counselorData?._id} />
            )}

            {activeTab === "incentive" && (
                <Incentive userData={counselorData} />
            )}
        </div>
    );
}