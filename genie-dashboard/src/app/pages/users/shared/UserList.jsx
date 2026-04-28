import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { BadgeCheck, Eye, Plus, SquarePen, Trash2, Users, UserCheck, UserX, BadgeAlert } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import { API, CampusaimAPI } from "../../../services/API";
import Breadcrumbs from "../../../components/ui/BreadCrumb/Breadcrumbs";
import SearchFilter from "../../../components/common/SearchFilter/SearchFilter";
import BulkActionsBar from "../../../components/common/BulkActionsBar/BulkActionsBar";
import DataTable from "../../../components/common/DataTable/DataTable";
import Pagination from "../../../components/common/Pagination/Pagination";
import AvatarCell from "../../../components/common/AvatarCell/AvatarCell";
import { ActionIconButton } from "../../../components/ui/Button/ActionIconButton";
import useDebounce from "../../../utils/useDebounce";
import StatsCards from "../../../components/common/StatsCards/StatsCards";

const ITEMS_PER_PAGE = 10;

/**
 * @param {string} roleKey  counselor | partner | teamLeader
 * @param {string} title    Page title
 * @param {string} apiPath  API endpoint
 * @param {string} basePath dashboard route base
 */
export default function UserList({
    roleKey,
    title,
    apiPath,
    basePath,
    onAddClick,
}) {
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selected, setSelected] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);

    const [searchParams, setSearchParams] = useSearchParams();
    // Safety boundary for pagination params
    const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

    const debouncedSearch = useDebounce(searchTerm, 500);
    // Track previous search to protect URL params on hard reload
    const prevSearchRef = useRef(debouncedSearch);

    /* ================= Fetch ================= */
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await CampusaimAPI.get(apiPath);
            console.log(res?.data?.data)
            // setItems(res.data || []);
            setItems(res?.data?.data || []); // ✅ FIXED
        } catch (error) {
            console.error("Fetch Data Error:", error);
            toast.error(error?.response?.data?.error || `Failed to fetch ${title}`);
        } finally {
            setIsLoading(false);
        }
    }, [apiPath, title]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /* ================= Search + Pagination ================= */
    const filteredItems = useMemo(() => {
        try {
            if (!debouncedSearch.trim()) return items;

            const q = debouncedSearch.toLowerCase();
            return items.filter((l) => {
                if (!l) return false;

                const name = l.name?.toLowerCase() || "";
                const email = l.email?.toLowerCase() || "";
                const mobile_no = String(l.mobile_no?.toLowerCase() || "");

                return (
                    name.includes(q) ||
                    email.includes(q) ||
                    mobile_no.includes(q)
                );
            });
        } catch (err) {
            console.error("Filtering error:", err);
            return [];
        }
    }, [items, debouncedSearch]);

    // Defensive pagination bounds mapped strictly to available array limits
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
    const safePage = Math.max(1, Math.min(currentPage, totalPages));
    const startIdx = (safePage - 1) * ITEMS_PER_PAGE;

    const currentItems = useMemo(() => {
        try {
            return filteredItems.slice(startIdx, startIdx + ITEMS_PER_PAGE);
        } catch (err) {
            console.error("Pagination slice error:", err);
            return [];
        }
    }, [filteredItems, startIdx]);

    /* ================= URL Parameter Management ================= */

    const handlePageChange = useCallback((page) => {
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            params.set("page", page.toString());
            return params;
        });
    }, [setSearchParams]);

    useEffect(() => {
        // Enforce page reset *only* on explicit user search inputs
        if (prevSearchRef.current !== debouncedSearch) {
            setSearchParams((prev) => {
                const params = new URLSearchParams(prev);
                params.set("page", "1");
                return params;
            });
            prevSearchRef.current = debouncedSearch;
        }
    }, [debouncedSearch, setSearchParams]);

    useEffect(() => {
        // Auto-correct URL if current page exceeds newly filtered bounds
        if (currentPage > totalPages && filteredItems.length > 0) {
            handlePageChange(totalPages);
        }
    }, [totalPages, currentPage, filteredItems.length, handlePageChange]);

    /* ================= Selection ================= */
    const toggleSelect = useCallback((id) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        try {
            if (!currentItems.length) return;

            setSelected(prev => {
                const pageIds = currentItems.map(row => row._id);
                const allSelected = pageIds.every(id => prev.has(id));
                const next = new Set(prev);

                if (allSelected) {
                    pageIds.forEach(id => next.delete(id));
                } else {
                    pageIds.forEach(id => next.add(id));
                }

                return next;
            });
        } catch (error) {
            console.error("Select all failed:", error);
        }
    }, [currentItems]);

    /* ================= Delete ================= */
    const confirmDelete = async (ids) => {
        try {
            const isBulk = Array.isArray(ids);

            const result = await Swal.fire({
                title: "Are you sure?",
                text: isBulk
                    ? `Delete ${ids.length} items?`
                    : "This action cannot be undone",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete",
            });

            if (!result.isConfirmed) return;

            if (isBulk) {
                await API.delete("/delete-multiple-user", { data: { ids } });
            } else {
                await API.delete(`/delete-user/${ids}`);
            }

            toast.success("Deleted successfully");
            setSelected(new Set());
            fetchData();
        } catch (error) {
            console.error("Delete Error:", error);
            toast.error(error?.response?.data?.message || "Delete failed");
        }
    };

    /* ================= Export ================= */
    const exportSelected = () => {
        try {
            if (!selected.size) {
                toast.error("Select at least one item");
                return;
            }

            const dataToExport = items
                .filter(i => selected.has(i._id))
                .map(i => ({
                    Name: i.name || "-",
                    Email: i.email || "-",
                    Phone: i.mobile_no || "-",
                }));

            const sheet = XLSX.utils.json_to_sheet(dataToExport);
            const book = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(book, sheet, title);

            const blob = new Blob(
                [XLSX.write(book, { bookType: "xlsx", type: "array" })],
                { type: "application/octet-stream" }
            );

            saveAs(blob, `${roleKey}.xlsx`);
            toast.success("Export successful");
        } catch (error) {
            console.error("Export Error:", error);
            toast.error("Failed to export data");
        }
    };

    /* ================= Columns ================= */
    const columns = useMemo(() => {
        const baseColumns = [
            {
                key: "user",
                label: title,
                render: u => <AvatarCell user={u} role={title} />,
            },

            /* ================= PARTNER ONLY ================= */
            ...(roleKey === "partner"
                ? [
                    {
                        key: "ref_code",
                        label: "Ref Code",
                        render: u => (
                            <span className="font-mono text-sm text-gray-700">
                                {u.ref_code || "—"}
                            </span>
                        ),
                    },
                ]
                : []),

            /* ================= COUNSELOR → ASSIGNED TL ================= */
            ...(roleKey === "counselor"
                ? [
                    {
                        key: "teamLeader",
                        label: "Assigned To",
                        render: u => {
                            if (!u.teamLeader) {
                                return (
                                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                                        Unassigned
                                    </span>
                                );
                            }

                            return (
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-800">
                                        {u.teamLeader.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        Team Leader
                                    </span>
                                </div>
                            );
                        },
                    },
                ]
                : []),

            // ...(roleKey === "teamLeader"
            //     ? [
            //         {
            //             key: "counselorCount",
            //             label: "Assigned Counselors",
            //             render: u => (
            //                 <span
            //                     className={`px-3 py-1 text-xs rounded-full font-medium
            //             ${u.counselorCount > 0
            //                             ? "bg-blue-100 text-blue-700"
            //                             : "bg-gray-100 text-gray-500"
            //                         }
            //         `}
            //                 >
            //                     {u.counselorCount} counselor{u.counselorCount !== 1 ? "s" : ""}
            //                 </span>
            //             ),
            //         },
            //     ]
            //     : []),


            /* ================= verified ================= */
            {
                key: "verified",
                label: "Verified",
                render: (u) => {
                    const verified = Boolean(u.verified);

                    return (
                        <span
                            className={`px-2 py-1 text-xs rounded-full font-semibold ${verified
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                                }`}
                        >
                            {verified ? "Verified" : "Unverified"}
                        </span>
                    );
                },
            },

            /* ================= ACTIONS ================= */
            {
                key: "actions",
                label: "Actions",
                render: u => (
                    <div className="flex items-center gap-2">

                        <ActionIconButton
                            label="View"
                            Icon={Eye}
                            variant="neutral"
                            onClick={() =>
                                navigate(`${basePath}/view/${u._id}`)
                            }
                        />

                        <ActionIconButton
                            label="Edit"
                            Icon={SquarePen}
                            variant="primary"
                            onClick={() =>
                                navigate(`${basePath}/edit/${u._id}`)
                            }
                        />

                        <ActionIconButton
                            label="Delete"
                            Icon={Trash2}
                            variant="danger"
                            onClick={() => confirmDelete(u._id)}
                        />
                    </div>
                ),
            },
        ];

        return baseColumns;
    }, [navigate, basePath, roleKey]);

    const statsData = useMemo(() => {
        let active = 0;
        let suspended = 0;
        let verified = 0;
        let notVerified = 0;

        for (const item of items) {
            if (item.status === "active") active++;
            else if (item.status === "suspended") suspended++;

            if (item.verified === true) verified++;
            else if (item.verified === false) notVerified++;
        }

        const total = items?.length || 0;

        return [
            {
                label: `Total ${title}`,
                value: total,
                icon: Users,
                iconBg: "bg-indigo-100",
                iconColor: "text-indigo-600",
            },
            {
                label: "Active",
                value: active,
                icon: UserCheck,
                iconBg: "bg-emerald-100",
                iconColor: "text-emerald-600",
            },
            {
                label: "Suspended",
                value: suspended,
                icon: UserX,
                iconBg: "bg-rose-100",
                iconColor: "text-rose-600",
            },
            {
                label: "Verified",
                value: verified,
                icon: BadgeCheck,
                iconBg: "bg-sky-100",
                iconColor: "text-sky-600",
            },
            {
                label: "Not Verified",
                value: notVerified,
                icon: BadgeAlert,
                iconBg: "bg-amber-100",
                iconColor: "text-amber-600",
            },
        ];
    }, [items, title]);

    return (
        <>
            <div className="space-y-6">
                <Breadcrumbs
                    items={[
                        { label: "Dashboard", to: "/dashboard" },
                        { label: title },
                    ]}
                    actions={[
                        onAddClick
                            ? {
                                label: `Add ${title}`,
                                onClick: onAddClick,
                                Icon: Plus,
                                variant: "primary",
                            }
                            : {
                                label: `Add ${title}`,
                                to: `${basePath}/add`,
                                Icon: Plus,
                                variant: "primary",
                            },
                    ]}
                />

                <StatsCards items={statsData} isLoading={isLoading} skeletonCount={5} />

                <SearchFilter value={searchTerm} onChange={setSearchTerm} />

                <BulkActionsBar
                    selectedCount={selected.size}
                    actions={[
                        { label: "Export Selected", action: "export" },
                        { label: "Delete", action: "delete" },
                    ]}
                    onAction={a =>
                        a === "export" ? exportSelected() : confirmDelete([...selected])
                    }
                    onClear={() => setSelected(new Set())}
                />

                <DataTable
                    columns={columns}
                    data={currentItems}
                    isLoading={isLoading}
                    selectable
                    rowKey={u => u._id}
                    selectedRows={selected}
                    onSelectRow={toggleSelect}
                    onSelectAll={handleSelectAll}
                    showSerial={true}
                    startIndex={(currentPage - 1) * ITEMS_PER_PAGE}
                />

                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredItems.length}
                    pageSize={ITEMS_PER_PAGE}
                    onPageChange={handlePageChange}
                />
            </div>
        </>
    );
}