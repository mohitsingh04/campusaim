import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { API } from "../../../services/API";
import { useAuth } from "../../../context/AuthContext";

import Breadcrumbs from "../../../components/ui/BreadCrumb/Breadcrumbs";
import SearchFilter from "../../../components/common/SearchFilter/SearchFilter";
import DataTable from "../../../components/common/DataTable/DataTable";
import Pagination from "../../../components/common/Pagination/Pagination";
import AvatarCell from "../../../components/common/AvatarCell/AvatarCell";

const ITEMS_PER_PAGE = 10;

export default function AssignedCounselors() {
    const navigate = useNavigate();
    const { authUser } = useAuth();

    const [counselors, setCounselors] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const teamLeaderId = authUser?._id;

    /* =========================
       Fetch Assigned Counselors
    ========================== */
    const fetchAssignedCounselors = useCallback(async () => {
        if (!teamLeaderId) return;

        try {
            setIsLoading(true);

            const res = await API.get(
                `/users/teamleaders/${teamLeaderId}/counselors`
            );

            setCounselors(res.data.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load assigned counselors");
        } finally {
            setIsLoading(false);
        }
    }, [teamLeaderId]);

    useEffect(() => {
        fetchAssignedCounselors();
    }, [fetchAssignedCounselors]);

    /* =========================
       Search + Pagination
    ========================== */
    const filteredCounselors = useMemo(() => {
        if (!searchTerm.trim()) return counselors;

        const q = searchTerm.toLowerCase();
        return counselors.filter(c =>
            c.name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            String(c.contact || "").includes(q)
        );
    }, [counselors, searchTerm]);

    const totalPages = Math.ceil(filteredCounselors.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentCounselors = filteredCounselors.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    /* =========================
       Table Columns
    ========================== */
    const columns = useMemo(() => [
        {
            key: "counselor",
            label: "Counselor",
            render: c => <AvatarCell user={c} role="counselor" />,
        },
        {
            key: "leads",
            label: "Leads",
            render: c => (
                <span
                    className={`px-2 py-1 text-xs rounded-full font-medium
                        ${c.leadCount > 0
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-500"
                        }
                    `}
                >
                    {c.leadCount} lead{c.leadCount !== 1 ? "s" : ""}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: c => (
                <button
                    onClick={() =>
                        navigate(
                            `/dashboard/users/counselors/view/${c._id}`
                        )
                    }
                    className="p-2 hover:bg-gray-100 rounded"
                    title="View Counselor"
                >
                    <Eye className="w-4 h-4" />
                </button>
            ),
        },
    ], [navigate]);

    /* =========================
       UI
    ========================== */
    return (
        <div className="space-y-6">
            <Breadcrumbs
                title="Assigned Counselors"
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Assigned Counselors" },
                ]}
            />

            <SearchFilter value={searchTerm} onChange={setSearchTerm} />

            <DataTable
                columns={columns}
                data={currentCounselors}
                isLoading={isLoading}
                rowKey={c => c._id}
                showSerial={true}
                startIndex={(currentPage - 1) * ITEMS_PER_PAGE}
            />

            <Pagination
                currentPage={currentPage}
                totalItems={filteredCounselors.length}
                pageSize={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
