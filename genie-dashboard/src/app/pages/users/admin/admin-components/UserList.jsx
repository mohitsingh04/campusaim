import React, { useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import SearchFilter from "../../../../components/common/SearchFilter/SearchFilter";
import BulkActionsBar from "../../../../components/common/BulkActionsBar/BulkActionsBar";
import DataTable from "../../../../components/common/DataTable/DataTable";

export default function UserList({ users = [], role }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState(new Set());

    /* ---------------- FILTER ---------------- */
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users;
        const q = searchTerm.toLowerCase();

        return users.filter(
            (u) =>
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                String(u.mobile_no || "").includes(q)
        );
    }, [users, searchTerm]);

    /* ---------------- SELECTION ---------------- */
    const toggleSelectUser = useCallback((id) => {
        setSelectedUsers((prev) => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        setSelectedUsers((prev) =>
            prev.size === filteredUsers.length
                ? new Set()
                : new Set(filteredUsers.map((u) => u._id))
        );
    }, [filteredUsers]);

    /* ---------------- EXPORT ---------------- */
    const exportSelected = () => {
        if (!selectedUsers.size) return toast.error("No users selected");

        const data = users
            .filter((u) => selectedUsers.has(u._id))
            .map((u) => ({
                Name: u.name,
                Email: u.email,
                Phone: u.mobile_no,
                Status: u.status === "active" ? "Active" : "Suspended",
                Verified: u.isVerified ? "Yes" : "No",
                ...(role === "partner" && { RefCode: u.ref_code }),
            }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, role);

        saveAs(
            new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })]),
            `${role}s.xlsx`
        );

        toast.success("Export successful");
    };

    /* ---------------- BULK ACTIONS ---------------- */
    const bulkActions = useMemo(() => {
        return [{ label: "Export Selected", action: "export" }];
    }, []);

    /* ---------------- COLUMNS ---------------- */
    const userColumns = useMemo(() => {
        const cols = [
            {
                key: "name",
                label: "Name",
                render: (u) => (
                    <span className="font-medium text-sm text-gray-900">
                        {u.name || "—"}
                    </span>
                ),
            },
            {
                key: "email",
                label: "Email",
                render: (u) => (
                    <span className="text-sm text-gray-700">
                        {u.email || "—"}
                    </span>
                ),
            },
            {
                key: "contact",
                label: "Phone",
                render: (u) => u.mobile_no || "—",
            },
        ];

        if (role === "partner") {
            cols.push({
                key: "ref_code",
                label: "Ref Code",
                render: (u) => u.ref_code || "—",
            });
        }

        cols.push({
            key: "status",
            label: "Status",
            render: (u) =>
                u.status === "active" ? (
                    <span className="bg-green-100 text-green-600 rounded-lg px-3 py-1 text-xs font-medium">
                        Active
                    </span>
                ) : (
                    <span className="bg-red-100 text-red-600 rounded-lg px-3 py-1 text-xs font-medium">
                        Suspended
                    </span>
                ),
        });

        return cols;
    }, [role]);

    return (
        <div className="space-y-4">
            {/* Search */}
            <SearchFilter value={searchTerm} onChange={setSearchTerm} />

            {/* Bulk */}
            <BulkActionsBar
                selectedCount={selectedUsers.size}
                actions={bulkActions}
                onAction={(action) => {
                    if (action === "export") exportSelected();
                }}
                onClear={() => setSelectedUsers(new Set())}
            />

            {/* Table */}
            <DataTable
                columns={userColumns}
                data={filteredUsers}
                selectable={true}
                selectedRows={selectedUsers}
                rowKey={(u) => u._id}
                onSelectRow={toggleSelectUser}
                onSelectAll={toggleSelectAll}
                showSerial={true} // ✅ added
                startIndex={0} // no pagination here
            />
        </div>
    );
}