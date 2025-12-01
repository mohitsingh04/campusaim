import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import {
  Column,
  CategoryProps,
  DashboardOutletContextProps,
} from "../../types/types";
import { DataTable } from "../../ui/tables/DataTable";
import { API } from "../../contexts/API";
import TableButton from "../../ui/button/TableButton";
import { Edit2, Eye, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Badge from "../../ui/badge/Badge";
import {
  getErrorResponse,
  getStatusColor,
  matchPermissions,
} from "../../contexts/Callbacks";
import { useOutletContext } from "react-router-dom";
import TableSkeletonWithOutCards from "../../ui/loadings/pages/TableSkeletonWithOutCards";

export function CategoryList() {
  const [allCategories, setAllCategories] = useState<CategoryProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { authUser, authLoading } =
    useOutletContext<DashboardOutletContextProps>();

  const getAllCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/category");
      setAllCategories(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

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
          const response = await API.delete(`/category/${id}`);

          toast.success(response.data.message || "Deleted successfully");
          getAllCategories();
        }
      } catch (error) {
        getErrorResponse(error);
      }
    },
    [getAllCategories]
  );

  const columns = useMemo<Column<CategoryProps>[]>(
    () => [
      { value: "category_name" as keyof CategoryProps, label: "Name" },
      {
        value: "parent_category" as keyof CategoryProps,
        label: "Parent Category",
      },
      {
        value: (row: CategoryProps) => (
          <Badge label={row?.status} color={getStatusColor(row?.status)} />
        ),
        label: "Status",
        key: "status",
        sortingKey: "status",
      },
      {
        label: "Actions",
        value: (row: CategoryProps) => (
          <div className="flex space-x-2">
            {!authLoading && (
              <>
                {matchPermissions(authUser?.permissions, "Read Category") && (
                  <TableButton
                    Icon={Eye}
                    color="blue"
                    size="sm"
                    buttontype="link"
                    href={`/dashboard/category/${row._id}`}
                  />
                )}

                {matchPermissions(authUser?.permissions, "Update Category") && (
                  <TableButton
                    Icon={Edit2}
                    color="green"
                    size="sm"
                    buttontype="link"
                    href={`/dashboard/category/${row._id}/edit`}
                  />
                )}

                {matchPermissions(authUser?.permissions, "Delete Category") && (
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
    [authUser?.permissions, authLoading, handleDelete]
  );

  if (loading) {
    return <TableSkeletonWithOutCards />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="All Category"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Category" },
        ]}
        extraButtons={[
          {
            label: "Create Category",
            path: "/dashboard/category/create",
            icon: Plus,
          },
        ]}
      />

      <DataTable<CategoryProps>
        data={allCategories}
        columns={columns}
        includeExportFields={["category_name", "parent_category"]}
      />
    </div>
  );
}
