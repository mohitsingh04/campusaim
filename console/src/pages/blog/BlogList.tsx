import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import {
  Column,
  BlogProps,
  DashboardOutletContextProps,
} from "../../types/types";
import { DataTable } from "../../ui/tables/DataTable";
import { API } from "../../contexts/API";
import TableButton from "../../ui/button/TableButton";
import { Edit2, Eye, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  getErrorResponse,
  getScoreStatus,
  getStatusColor,
  matchPermissions,
} from "../../contexts/Callbacks";
import { Link, useOutletContext } from "react-router-dom";
import Badge from "../../ui/badge/Badge";
import { CircularProgress } from "../../ui/progress/CircularProgress";
import TableSkeletonWithOutCards from "../../ui/loadings/pages/TableSkeletonWithOutCards";

export function BlogList() {
  const [allBlogs, setAllBlogs] = useState<BlogProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { authUser, authLoading } =
    useOutletContext<DashboardOutletContextProps>();

  const getAllBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const [blogsResult, seoResult] = await Promise.allSettled([
        API.get("/blog"),
        API.get("/all/seo?type=blog"),
      ]);

      if (blogsResult.status === "fulfilled") {
        let blogs = blogsResult.value.data;

        if (seoResult.status === "fulfilled") {
          const seoData = seoResult.value.data;

          blogs = blogs.map((blog: any) => {
            const seoMatch = seoData.find(
              (seo: any) => seo.blog_id === blog._id
            );
            return {
              ...blog,
              seo_score: seoMatch ? seoMatch.seo_score : 0,
              blog_trend: getScoreStatus(seoMatch ? seoMatch.seo_score : 0),
            };
          });
        }
        setAllBlogs(blogs);
      }
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllBlogs();
  }, [getAllBlogs]);

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
          const response = await API.delete(`/blog/${id}`);
          toast.success(response.data.message || "Deleted successfully");
          getAllBlogs();
        }
      } catch (error) {
        getErrorResponse(error);
      }
    },
    [getAllBlogs]
  );

  const columns = useMemo<Column<BlogProps>[]>(
    () => [
      { value: "title" as keyof BlogProps, label: "Title" },
      {
        value: (row: BlogProps) => (
          <div>
            {!authLoading && (
              <>
                {matchPermissions(authUser?.permissions, "Read Blog Seo") ? (
                  <Link to={`/dashboard/blog/${row?._id}/seo`}>
                    <CircularProgress value={row?.seo_score || 0} />
                  </Link>
                ) : (
                  <CircularProgress value={row?.seo_score || 0} />
                )}
              </>
            )}
          </div>
        ),
        sortingKey: "seo_score",
        label: "SEO SCORE",
        key: "seo_score",
      },
      {
        value: (row: BlogProps) => (
          <Badge label={row?.status} color={getStatusColor(row?.status)} />
        ),
        label: "Status",
        key: "status",
        sortingKey: "status",
      },
      {
        label: "Actions",
        value: (row: BlogProps) => (
          <div className="flex space-x-2">
            {!authLoading && (
              <>
                {matchPermissions(authUser?.permissions, "Read Blog") && (
                  <TableButton
                    Icon={Eye}
                    color="blue"
                    size="sm"
                    buttontype="link"
                    href={`/dashboard/blog/${row._id}`}
                  />
                )}
                {matchPermissions(authUser?.permissions, "Update Blog") && (
                  <TableButton
                    Icon={Edit2}
                    color="green"
                    size="sm"
                    buttontype="link"
                    href={`/dashboard/blog/${row._id}/edit`}
                  />
                )}
                {matchPermissions(authUser?.permissions, "Delete Blog") && (
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
    [authLoading, authUser, handleDelete]
  );

  const tabFilters = useMemo(() => {
    const uniqueOptions = (field: keyof BlogProps) =>
      Array.from(
        new Set(
          allBlogs
            .map((u) => u[field])
            .filter(Boolean)
            .map((v) => String(v))
        )
      );

    return [
      {
        label: "status",
        columns: columns.map((c) => c.label),
        filterField: "status" as keyof BlogProps,
        options: uniqueOptions("status"),
      },
      {
        label: "Top Blog",
        columns: columns.map((c) => c.label),
        filterField: "blog_trend" as keyof BlogProps,
        options: uniqueOptions("blog_trend"),
      },
    ];
  }, [allBlogs, columns]);

  if (loading) {
    return <TableSkeletonWithOutCards />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="All Blog"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Blog" },
        ]}
        extraButtons={[
          {
            label: "Create Blog",
            path: "/dashboard/blog/create",
            icon: Plus,
          },
        ]}
      />
      <DataTable<BlogProps>
        data={allBlogs}
        columns={columns}
        tabFilters={tabFilters}
        includeExportFields={["title", "seo_score"]}
      />
    </div>
  );
}
