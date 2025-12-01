import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import {
  BlogProps,
  Column,
  DashboardOutletContextProps,
  NewsProps,
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
  getScoreStatus,
  getStatusColor,
  matchPermissions,
} from "../../contexts/Callbacks";
import { Link, useOutletContext } from "react-router-dom";
import { CircularProgress } from "../../ui/progress/CircularProgress";
import TableSkeletonWithOutCards from "../../ui/loadings/pages/TableSkeletonWithOutCards";

export default function NewsList() {
  const [allNews, setNews] = useState<NewsProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { authUser, authLoading } =
    useOutletContext<DashboardOutletContextProps>();

  const getNews = useCallback(async () => {
    setLoading(true);
    try {
      const [newsResult, seoResult] = await Promise.allSettled([
        API.get("/news-and-updates"),
        API.get("/all/seo?type=news"),
      ]);

      if (newsResult.status === "fulfilled") {
        let news = newsResult.value.data;

        if (seoResult.status === "fulfilled") {
          const seoData = seoResult.value.data;

          // Merge seo_score into blogs
          news = news.map((event: any) => {
            const seoMatch = seoData.find(
              (seo: any) => seo.news_id === event._id
            );
            return {
              ...event,
              seo_score: seoMatch ? seoMatch.seo_score : 0,
              news_trend: getScoreStatus(seoMatch ? seoMatch.seo_score : 0),
            };
          });
        }

        setNews(news);
      }
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getNews();
  }, [getNews]);

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
          const response = await API.delete(`/news-and-updates/${id}`);

          toast.success(response.data.message || "Deleted successfully");
          getNews();
        }
      } catch (error) {
        getErrorResponse(error);
      }
    },
    [getNews]
  );

  const columns = useMemo<Column<NewsProps>[]>(
    () => [
      { value: "title" as keyof NewsProps, label: "Title" },
      {
        value: (row: NewsProps) => (
          <div>
            {!authLoading && (
              <>
                {matchPermissions(
                  authUser?.permissions,
                  "Read News & Updates Seo"
                ) ? (
                  <Link to={`/dashboard/news-and-update/${row?._id}/seo`}>
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
        value: (row: NewsProps) => (
          <Badge label={row?.status} color={getStatusColor(row?.status)} />
        ),
        label: "Status",
        key: "status",
        sortingKey: "status",
      },
      {
        label: "Actions",
        value: (row: NewsProps) => (
          <div className="flex space-x-2">
            {!authLoading && (
              <>
                {matchPermissions(
                  authUser?.permissions,
                  "Read News & Updates"
                ) && (
                  <TableButton
                    Icon={Eye}
                    color="blue"
                    size="sm"
                    buttontype="link"
                    href={`/dashboard/news-and-updates/${row._id}`}
                  />
                )}

                {matchPermissions(
                  authUser?.permissions,
                  "Update News & Updates"
                ) && (
                  <TableButton
                    Icon={Edit2}
                    color="green"
                    size="sm"
                    buttontype="link"
                    href={`/dashboard/news-and-updates/${row._id}/edit`}
                  />
                )}

                {matchPermissions(
                  authUser?.permissions,
                  "Delete News & Updates"
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

  const tabFilters = useMemo(() => {
    const uniqueOptions = (field: keyof BlogProps) =>
      Array.from(
        new Set(
          allNews
            .map((u) => u[field])
            .filter(Boolean)
            .map((v) => String(v))
        )
      );

    return [
      {
        label: "Status",
        columns: columns.map((c) => c.label),
        filterField: "status" as keyof BlogProps,
        options: uniqueOptions("status"),
      },
    ];
  }, [allNews, columns]);

  if (loading) {
    return <TableSkeletonWithOutCards />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="All News and Updates"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "News & Updates" },
        ]}
        extraButtons={[
          {
            label: "Create Event",
            path: "/dashboard/news-and-updates/create",
            icon: Plus,
          },
        ]}
      />

      <DataTable<NewsProps>
        data={allNews}
        columns={columns}
        tabFilters={tabFilters}
      />
    </div>
  );
}
