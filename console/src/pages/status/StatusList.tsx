import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import {
  Column,
  DashboardOutletContextProps,
  StatusProps,
} from "../../types/types";
import { DataTable } from "../../ui/tables/DataTable";
import { API } from "../../contexts/API";
import TableButton from "../../ui/button/TableButton";
import { Edit2, Eye, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { getErrorResponse, matchPermissions } from "../../contexts/Callbacks";
import { useOutletContext } from "react-router-dom";
import TableSkeletonWithOutCards from "../../ui/loadings/pages/TableSkeletonWithOutCards";

export function StatusList() {
  const [allStatus, setAllStatus] = useState<StatusProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { authUser, authLoading } =
    useOutletContext<DashboardOutletContextProps>();

  const getAllStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/status");
      setAllStatus(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllStatus();
  }, [getAllStatus]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        // Confirmation dialog
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "Once deleted, you will not be able to recover this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
          const response = await API.delete(`/status/${id}`);

          toast.success(response.data.message || "Deleted successfully");
          getAllStatus();
        }
      } catch (error) {
        getErrorResponse(error);
      }
    },
    [getAllStatus]
  );

  const columns = useMemo<Column<StatusProps>[]>(
    () => [
      { value: "name" as keyof StatusProps, label: "Name" },
      { value: "parent_status" as keyof StatusProps, label: "Parent Status" },
      {
        label: "Actions",
        value: (row: StatusProps) => (
          <div className="flex space-x-2">
            {!authLoading && (
              <>
                {matchPermissions(authUser?.permissions, "Read Status") && (
                  <TableButton
                    Icon={Eye}
                    color="blue"
                    size="sm"
                    buttontype="link"
                    href={`/dashboard/status/${row._id}`}
                  />
                )}
                {matchPermissions(authUser?.permissions, "Update Status") && (
                  <TableButton
                    Icon={Edit2}
                    color="green"
                    size="sm"
                    buttontype="link"
                    href={`/dashboard/status/${row._id}/edit`}
                  />
                )}
                {matchPermissions(authUser?.permissions, "Delete Status") && (
                  <TableButton
                    Icon={Trash2}
                    color="red"
                    size="sm"
                    buttontype="button"
                    onClick={() => handleDelete(row._id)}
                  />
                )}
              </>
            )}
          </div>
        ),
        key: "actions",
      },
    ],
    [handleDelete, authLoading, authUser?.permissions]
  );

  if (loading) return <TableSkeletonWithOutCards />;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="All Status"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Status" },
        ]}
        extraButtons={[
          {
            label: "Create Status",
            path: "/dashboard/status/create",
            icon: Plus,
          },
        ]}
      />

      <DataTable<StatusProps> data={allStatus} columns={columns} />
    </div>
  );
}
