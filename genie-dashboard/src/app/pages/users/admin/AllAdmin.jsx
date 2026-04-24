import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Eye, ShieldCheck, SquarePen, Trash2, UserCheck, Users, UserX } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import { API } from "../../../services/API";
import { useAuth } from "../../../context/AuthContext";
import Breadcrumbs from "../../../components/ui/BreadCrumb/Breadcrumbs";
import SearchFilter from "../../../components/common/SearchFilter/SearchFilter";
import BulkActionsBar from "../../../components/common/BulkActionsBar/BulkActionsBar";
import DataTable from "../../../components/common/DataTable/DataTable";
import Pagination from "../../../components/common/Pagination/Pagination";
import AvatarCell from "../../../components/common/AvatarCell/AvatarCell";
import { ActionIconButton } from "../../../components/ui/Button/ActionIconButton";
import StatsCards from "../../../components/common/StatsCards/StatsCards";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useDebounce from "../../../utils/useDebounce";

const ITEMS_PER_PAGE = 10;

// Helper: Moved outside to avoid re-creation
const timeAgo = (date) => {
    if (!date) return "N/A";
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

// ========================= API SERVICES =========================
const fetchAdmins = async ({ page, search }) => {
    const { data } = await API.get(`/admins`, {
        params: { page, limit: ITEMS_PER_PAGE, search }
    });
    return data;
};

const deleteAdmin = async (ids) => {
    return Array.isArray(ids)
        ? API.delete("/delete-multiple-user", { data: { ids } })
        : API.delete(`/delete-user/${ids}`);
};

// ========================= COMPONENT =========================
export default function AllAdmin() {
    const navigate = useNavigate();
    const { authUser } = useAuth();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const prevSearchRef = useRef(debouncedSearch);

    const [selectedAdmins, setSelectedAdmins] = useState(new Set());

    // ========================= QUERY LOGIC =========================
    const { data: adminData = { admins: [], stats: [], total: 0 }, isLoading, isError, error } = useQuery({
        queryKey: ["admins", { page: currentPage, search: debouncedSearch }],
        queryFn: () => fetchAdmins({
            page: currentPage,
            search: debouncedSearch.length >= 2 ? debouncedSearch : "",
        }),
        enabled: !!authUser,
        staleTime: 1000 * 60 * 5,
        placeholderData: (previousData) => previousData, // Modern TanStack replacement for keepPreviousData
        select: (data) => {
            const admins = data.users || [];
            let counts = { active: 0, suspended: 0, verified: 0, unverified: 0 };

            admins.forEach(admin => {
                if (admin?.status === "active") counts.active++;
                else if (admin?.status === "suspended") counts.suspended++;
                admin?.verified ? counts.verified++ : counts.unverified++;
            });

            const stats = [
                { label: "Total Admins", value: data.total, icon: Users, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
                { label: "Active Admins", value: counts.active, icon: ShieldCheck, iconBg: "bg-green-100", iconColor: "text-green-600" },
                { label: "Suspended Admins", value: counts.suspended, icon: UserX, iconBg: "bg-red-100", iconColor: "text-red-600" },
                { label: "Verified Admins", value: counts.verified, icon: UserCheck, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
                { label: "Unverified Admins", value: counts.unverified, icon: UserX, iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
            ];

            return { admins, stats, total: data.total };
        },
    });

    // ========================= MUTATIONS =========================

    const deleteMutation = useMutation({
        mutationFn: deleteAdmin,
        onSuccess: () => {
            toast.success("Action completed successfully");
            setSelectedAdmins(new Set());
            queryClient.invalidateQueries({ queryKey: ["admins"] });
        },
        onError: (err) => toast.error(err.message || "Operation failed"),
    });

    // ========================= HANDLERS =========================
    const handlePageChange = useCallback((page) => {
        setSearchParams((prev) => {
            prev.set("page", page.toString());
            return prev;
        });
    }, [setSearchParams]);

    useEffect(() => {
        if (prevSearchRef.current !== debouncedSearch) {
            handlePageChange(1);
            prevSearchRef.current = debouncedSearch;
        }
    }, [debouncedSearch, handlePageChange]);

    const toggleSelect = useCallback((id) => {
        setSelectedAdmins((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        if (!adminData.admins.length) return;
        const pageIds = adminData.admins.map((row) => row._id);
        const allOnPageSelected = pageIds.every((id) => selectedAdmins.has(id));

        setSelectedAdmins((prev) => {
            const next = new Set(prev);
            allOnPageSelected ? pageIds.forEach(id => next.delete(id)) : pageIds.forEach(id => next.add(id));
            return next;
        });
    }, [adminData.admins, selectedAdmins]);

    const confirmDelete = async (ids) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: Array.isArray(ids) ? `Delete ${ids.length} records?` : "This cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            confirmButtonColor: "#EF4444",
        });
        if (result.isConfirmed) deleteMutation.mutate(ids);
    };

    const exportSelected = () => {
        if (!selectedAdmins.size) return toast.error("Select data first");
        const rows = adminData.admins
            .filter((a) => selectedAdmins.has(a._id))
            .map((a) => ({ Name: a.name, Email: a.email, Phone: a.mobile || a.contact, City: a.city, Role: a.role, Status: a.status, Verified: a.verified, Provider: a.provider }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Admins");
        XLSX.writeFile(workbook, "admins_export.xlsx");
    };

    // ========================= TABLE CONFIG =========================

    const columns = useMemo(() => [
        { key: "admin", label: "Admin", render: (admin) => <AvatarCell user={admin} role="admin" /> },
        {
            key: "status",
            label: "Status",
            render: (admin) => (
                <span className={`px-2 py-1 text-xs rounded-full font-bold ${admin.verified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {admin.verified ? "Verified" : "Unverified"}
                </span>
            )
        },
        { key: "lastLoginAt", label: "Last Login", render: (admin) => <span className="text-sm font-medium text-gray-600">{timeAgo(admin.lastLoginAt)}</span> },
        {
            key: "actions",
            label: "Actions",
            render: (admin) => (
                <div className="flex gap-2">
                    <ActionIconButton label="View" Icon={Eye} variant="neutral" onClick={() => navigate(`/dashboard/admins/view/${admin._id}`)} />
                    <ActionIconButton label="Edit" Icon={SquarePen} variant="primary" onClick={() => navigate(`/dashboard/admins/edit/${admin._id}`)} />
                    <ActionIconButton label="Delete" Icon={Trash2} variant="danger" onClick={() => confirmDelete(admin._id)} />
                </div>
            ),
        },
    ], [navigate]);

    return (
        <div className="space-y-6 pb-8">
            <Breadcrumbs title="Admins" items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Admins" }]} />

            <StatsCards items={adminData.stats} isLoading={isLoading} skeletonCount={5} />

            <SearchFilter value={searchTerm} onChange={setSearchTerm} className="w-full md:max-w-md" />

            <BulkActionsBar
                selectedCount={selectedAdmins.size}
                actions={[{ label: "Export", action: "export" }, { label: "Delete", action: "delete" }]}
                onAction={(a) => a === "export" ? exportSelected() : confirmDelete([...selectedAdmins])}
                onClear={() => setSelectedAdmins(new Set())}
            />

            <DataTable
                columns={columns}
                data={adminData.admins}
                isLoading={isLoading}
                selectable
                rowKey={(a) => a._id}
                selectedRows={selectedAdmins}
                onSelectRow={toggleSelect}
                onSelectAll={handleSelectAll}
                showSerial
                startIndex={(currentPage - 1) * ITEMS_PER_PAGE}
            />

            <Pagination currentPage={currentPage} totalItems={adminData.total} pageSize={ITEMS_PER_PAGE} onPageChange={handlePageChange} />
        </div>
    );
}