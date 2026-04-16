import React, { useEffect, useMemo, useState, useRef } from "react";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import toast from "react-hot-toast";
import { API } from "../../services/API";

export default function Test() {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchLeads = async () => {
        try {
            setIsLoading(true);
            const { data } = await API.get("/leads");
            setLeads(data?.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Internal server error.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Testing" },
                ]}
            />

            {/* ✅ Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <h2 className="text-base font-semibold text-gray-800">Leads</h2>
                    <span className="text-xs text-gray-500">{leads?.length || 5} results</span>
                </div>
            </div>
        </div>
    );
}