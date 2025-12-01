import { useState, useMemo, useCallback, useEffect } from "react";
import { Eye, Trash2 } from "lucide-react";
import {
  DashboardOutletContextProps,
  type Column,
  type EnquiryProps,
} from "../../types/types";
import Badge from "../../ui/badge/Badge";
import TableButton from "../../ui/button/TableButton";
import { DataTable } from "../../ui/tables/DataTable";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { API } from "../../contexts/API";
import { useOutletContext } from "react-router-dom";
import {
  getErrorResponse,
  getStatusColor,
  matchPermissions,
} from "../../contexts/Callbacks";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import TableSkeletonWithOutCards from "../../ui/loadings/pages/TableSkeletonWithOutCards";

export function EnquiryList() {
  const [enquiry, setEnquiry] = useState<EnquiryProps[]>([]);
  const { authUser, authLoading } =
    useOutletContext<DashboardOutletContextProps>();
  const [loading, setLoading] = useState(true);

  const getAllEnquiry = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/enquiry");
      setEnquiry(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllEnquiry();
  }, [getAllEnquiry]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
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
          const response = await API.delete(`/enquiry/soft/${id}`);

          toast.success(response.data.message || "Deleted successfully");
          getAllEnquiry();
        }
      } catch (error) {
        getErrorResponse(error);
      }
    },
    [getAllEnquiry]
  );

  const columns = useMemo<Column<EnquiryProps>[]>(
    () => [
      { value: "name" as keyof EnquiryProps, label: "Name" },
      { value: "property_name" as keyof EnquiryProps, label: "Property" },
      {
        value: (row: EnquiryProps) => (
          <Badge label={row.status} color={getStatusColor(row?.status)} />
        ),
        label: "Status",
        key: "statusBadge",
      },
      {
        label: "Actions",
        value: (row: EnquiryProps) => (
          <div className="flex space-x-2">
            {!authLoading && (
              <>
                {matchPermissions(authUser?.permissions, "Read Enquiry") && (
                  <TableButton
                    Icon={Eye}
                    color="blue"
                    size="sm"
                    buttontype="link"
                    href={`/dashboard/enquiry/${row._id}`}
                  />
                )}
                {matchPermissions(authUser?.permissions, "Delete Enquiry") && (
                  <TableButton
                    Icon={Trash2}
                    color="red"
                    size="sm"
                    buttontype="button"
                    onClick={() => handleDelete(row._id || "")}
                  />
                )}
              </>
            )}
          </div>
        ),
        key: "actions",
      },
    ],
    [authLoading, authUser?.permissions, handleDelete]
  );

  if (loading) {
    return <TableSkeletonWithOutCards />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="All Enquiry"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Enquiry" },
        ]}
        extraButtons={[
          {
            label: "Archive Enquiry",
            path: "/dashboard/enquiry/archive",
            icon: Trash2,
          },
        ]}
      />
      <DataTable<EnquiryProps> data={enquiry} columns={columns} />
    </div>
  );
}
