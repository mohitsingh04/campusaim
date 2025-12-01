import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  BlogCategoryProps,
  Column,
  DashboardOutletContextProps,
} from "../../../types/types";
import { API } from "../../../contexts/API";
import {
  getErrorResponse,
  getStatusColor,
  matchPermissions,
} from "../../../contexts/Callbacks";
import Badge from "../../../ui/badge/Badge";
import TableButton from "../../../ui/button/TableButton";
import { Breadcrumbs } from "../../../ui/breadcrumbs/Breadcrumbs";
import { DataTable } from "../../../ui/tables/DataTable";
import { useOutletContext } from "react-router-dom";
import TableSkeletonWithOutCards from "../../../ui/loadings/pages/TableSkeletonWithOutCards";

export function BlogCategoryList() {
  const [allBlogsCategory, setAllBlogsCategory] = useState<BlogCategoryProps[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const { authUser, authLoading } =
    useOutletContext<DashboardOutletContextProps>();

  const getAllBlogsCategory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/blog/category/all");
      setAllBlogsCategory(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllBlogsCategory();
  }, [getAllBlogsCategory]);

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
          const response = await API.delete(`/blog/category/${id}`);

          toast.success(response.data.message || "Deleted successfully");
          getAllBlogsCategory();
        }
      } catch (error) {
        getErrorResponse(error);
      }
    },
    [getAllBlogsCategory]
  );

  const columns = useMemo<Column<BlogCategoryProps>[]>(
    () => [
      {
        value: "blog_category" as keyof BlogCategoryProps,
        label: "Blog Category",
      },
      {
        value: "parent_category" as keyof BlogCategoryProps,
        label: "Parent Category",
      },
      {
        value: (row: BlogCategoryProps) => (
          <Badge label={row.status} color={getStatusColor(row?.status)} />
        ),
        label: "Status",
        key: "status",
        sortingKey: "status",
      },
      {
        label: "Actions",
        value: (row: BlogCategoryProps) => (
          <div className="flex space-x-2">
            {!authLoading && (
              <>
                {matchPermissions(
                  authUser?.permissions,
                  "Update Blog Category"
                ) && (
                  <TableButton
                    Icon={Edit2}
                    color="green"
                    size="sm"
                    buttontype="link"
                    href={`/dashboard/blog/category/${row._id}/edit`}
                  />
                )}

                {matchPermissions(
                  authUser?.permissions,
                  "Delete Blog Category"
                ) && (
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
    [authLoading, authUser?.permissions, handleDelete]
  );

  if (loading) {
    return <TableSkeletonWithOutCards />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="All Blog Category"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Blog", path: "/dashboard/blog" },
          { label: "Category" },
        ]}
        extraButtons={[
          {
            label: "Create Blog",
            path: "/dashboard/blog/category/create",
            icon: Plus,
          },
        ]}
      />

      <DataTable<BlogCategoryProps> data={allBlogsCategory} columns={columns} />
    </div>
  );
}
