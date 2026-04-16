import React, { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2, Clock3, XCircle, Eye, Layers, Filter
} from "lucide-react";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";

import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import SearchFilter from "../../components/common/SearchFilter/SearchFilter";
import DataTable from "../../components/common/DataTable/DataTable";
import Pagination from "../../components/common/Pagination/Pagination";
import StatsCards from "../../components/common/StatsCards/StatsCards";

import { API } from "../../services/API";
import useDebounce from "../../utils/useDebounce";
import { ActionIconButton } from "../../components/ui/Button/ActionIconButton";

const ITEMS_PER_PAGE = 10;

/* ================= API ================= */
const fetchSupport = async ({ page, search, status, category }) => {
  try {
    const { data } = await API.get("/support", {
      params: { page, limit: ITEMS_PER_PAGE, search, status, category }
    });
    return data;
  } catch (err) {
    throw new Error(err?.response?.data?.message || "Failed to fetch support");
  }
};

export default function AllSupport() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const pageFromURL = Math.max(1, parseInt(searchParams.get("page")) || 1);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const prevSearchRef = useRef(debouncedSearch);

  /* ===== RESET PAGE ON SEARCH ===== */
  useEffect(() => {
    if (prevSearchRef.current !== debouncedSearch) {
      setSearchParams(prev => {
        const params = new URLSearchParams(prev);
        params.set("page", "1");
        return params;
      });
      prevSearchRef.current = debouncedSearch;
    }
  }, [debouncedSearch, setSearchParams]);

  /* ===== FETCH ===== */
  const { data, isLoading, isError } = useQuery({
    queryKey: ["support", pageFromURL, debouncedSearch, statusFilter, categoryFilter],
    queryFn: () => fetchSupport({
      page: pageFromURL,
      search: debouncedSearch,
      status: statusFilter,
      category: categoryFilter
    }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

  const support = data?.data || [];
  const total = data?.total || 0;

  /* ===== PAGE CHANGE ===== */
  const handlePageChange = (page) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set("page", page.toString());
      return params;
    });
  };

  /* ===== TABLE ===== */
  const columns = useMemo(() => [
    {
      key: "name",
      label: "User",
      render: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      )
    },
    {
      key: "category",
      label: "Category",
      render: (row) => (
        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
          {row.category}
        </span>
      )
    },
    {
      key: "subject",
      label: "Subject",
      render: (row) => (
        <span className="truncate max-w-[200px] block">
          {row.subject}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const MAP = {
          open: "bg-yellow-100 text-yellow-700",
          in_progress: "bg-blue-100 text-blue-700",
          resolved: "bg-green-100 text-green-700",
          closed: "bg-gray-200 text-gray-700"
        };
        return (
          <span className={`px-2 py-1 text-xs rounded font-semibold ${MAP[row.status]}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      key: "createdAt",
      label: "Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <ActionIconButton
            label="View"
            Icon={Eye}
            variant="neutral"
            onClick={() => navigate(`/dashboard/support/view/${row._id}`)}
          />
        </div>
      )
    }
  ], [navigate]);

  /* ===== STATS ===== */
  const statsData = useMemo(() => {
    let open = 0, inProgress = 0, resolved = 0, closed = 0;

    support.forEach(item => {
      if (item.status === "open") open++;
      else if (item.status === "in_progress") inProgress++;
      else if (item.status === "resolved") resolved++;
      else if (item.status === "closed") closed++;
    });

    return [
      {
        label: "Total Tickets",
        value: total,
        icon: Layers,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600"
      },
      {
        label: "Open",
        value: open,
        icon: Clock3,
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600"
      },
      {
        label: "In Progress",
        value: inProgress,
        icon: Filter,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600"
      },
      {
        label: "Resolved",
        value: resolved,
        icon: CheckCircle2,
        iconBg: "bg-green-100",
        iconColor: "text-green-600"
      },
      {
        label: "Closed",
        value: closed,
        icon: XCircle,
        iconBg: "bg-gray-200",
        iconColor: "text-gray-700"
      }
    ];
  }, [support, total]);

  if (isError) {
    return <div className="p-6 text-center text-red-500">Failed to load support data</div>;
  }

  return (
    <div className="space-y-6">

      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Support", active: true }
        ]}
      />

      {/* Stats */}
      <StatsCards items={statsData} isLoading={isLoading} />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">

        <SearchFilter value={searchTerm} onChange={setSearchTerm} />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Category</option>
          <option value="general">General</option>
          <option value="technical">Technical</option>
          <option value="billing">Billing</option>
          <option value="account">Account</option>
          <option value="feature">Feature</option>
        </select>

      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={support}
        isLoading={isLoading}
        rowKey={(row) => row._id}
        showSerial={true}
        startIndex={(pageFromURL - 1) * ITEMS_PER_PAGE}
      />

      {/* Pagination */}
      <Pagination
        currentPage={pageFromURL}
        totalItems={total}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
      />

    </div>
  );
}