import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, SquarePen, Trash2, Plus, Building2, CheckCircle2, XCircle, Globe } from "lucide-react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

// UI Components
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import SearchFilter from "../../components/common/SearchFilter/SearchFilter";
import DataTable from "../../components/common/DataTable/DataTable";
import Pagination from "../../components/common/Pagination/Pagination";
import StatsCards from "../../components/common/StatsCards/StatsCards";
import { ActionIconButton } from "../../components/ui/Button/ActionIconButton";

// Utils & API
import { API } from "../../services/API";
import useDebounce from "../../utils/useDebounce";
import { OrganizationViewModal } from "../../components/modal/OrganizationViewModal";

const ITEMS_PER_PAGE = 10;

/* =========================
    API FETCHERS
========================= */
const fetchOrganizations = async ({ page, search }) => {
  const { data } = await API.get("/organization/all", {
    params: { page, limit: ITEMS_PER_PAGE, search },
  });
  return data;
};

const deleteOrganization = async (id) => {
  return await API.delete(`/organization/${id}`);
};

export default function AllOrganization() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);

  // 1. URL State Management
  const pageFromURL = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const prevSearchRef = useRef(debouncedSearch);

  // 2. Reset page to 1 when search changes
  useEffect(() => {
    if (prevSearchRef.current !== debouncedSearch) {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", "1");
        return params;
      });
      prevSearchRef.current = debouncedSearch;
    }
  }, [debouncedSearch, setSearchParams]);

  /* =========================
      DATA FETCHING (React Query)
  ========================= */
  const { data, isLoading, isError } = useQuery({
    queryKey: ["organizations", pageFromURL, debouncedSearch],
    queryFn: () => fetchOrganizations({ page: pageFromURL, search: debouncedSearch }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

  const organizations = data?.data || [];
  const pagination = data?.pagination || {};

  const handleViewDetails = (org) => {
    setSelectedOrg(org);
    setIsViewModalOpen(true);
  };

  /* =========================
      MUTATIONS
  ========================= */
  const deleteMutation = useMutation({
    mutationFn: deleteOrganization,
    onSuccess: () => {
      toast.success("Organization deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error) => toast.error(error.message || "Delete failed"),
  });

  const confirmDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Organization?",
      text: "This will remove all associated data.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });
    if (result.isConfirmed) deleteMutation.mutate(id);
  };

  /* =========================
      TABLE CONFIGURATION
  ========================= */
  const columns = useMemo(() => [
    {
      key: "organization_name",
      label: "Organization",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.organization_name}</span>
          {row.website && (
            <a
              href={row.website.startsWith('http') ? row.website : `https://${row.website}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-500 hover:underline flex items-center gap-1"
            >
              <Globe size={12} /> {row.website.replace(/(^\w+:|^)\/\//, '')}
            </a>
          )}
        </div>
      ),
    },
    {
      key: "niche",
      label: "Niche",
      render: (row) => (
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md border border-gray-200">
          {row?.nicheId?.name || "Uncategorized"}
        </span>
      ),
    },
    {
      key: "createdBy",
      label: "Added By",
      render: (row) => (
        <div className="flex flex-col text-sm">
          <span className="font-medium text-gray-700">{row?.createdBy?.name || "System"}</span>
          <span className="text-xs text-gray-400">{row?.createdBy?.email || ""}</span>
        </div>
      ),
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
            onClick={() => handleViewDetails(row)}
          />
          <ActionIconButton
            label="Delete"
            Icon={Trash2}
            variant="danger"
            onClick={() => confirmDelete(row._id)}
          />
        </div>
      ),
    },
  ], [navigate]);

  /* =========================
      STATS CALCULATION
  ========================= */
  const statsData = useMemo(() => [
    { label: "Total Orgs", value: pagination.total || 0, icon: Building2, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { label: "Active", value: organizations.filter(o => o.status === 'active').length, icon: CheckCircle2, iconBg: "bg-green-100", iconColor: "text-green-600" },
    { label: "Inactive", value: organizations.filter(o => o.status === 'inactive').length, icon: XCircle, iconBg: "bg-red-100", iconColor: "text-red-600" },
  ], [organizations, pagination.total]);

  if (isError) return <div className="p-6 text-center text-red-500">Error loading organizations.</div>;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Organizations", active: true }]}
        actions={[{ label: "Add Organization", to: "/dashboard/organization/add", Icon: Plus, variant: "primary" }]}
      />

      <StatsCards items={statsData} isLoading={isLoading} />

      <SearchFilter value={searchTerm} onChange={setSearchTerm} />

      <DataTable
        columns={columns}
        data={organizations}
        isLoading={isLoading}
        rowKey={(row) => row._id}
        showSerial
        startIndex={(pageFromURL - 1) * ITEMS_PER_PAGE}
      />

      <Pagination
        currentPage={pageFromURL}
        totalItems={pagination.total || 0}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={(page) => setSearchParams(prev => {
          const p = new URLSearchParams(prev);
          p.set("page", page);
          return p;
        })}
      />

      <OrganizationViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        data={selectedOrg}
      />
    </div>
  );
}