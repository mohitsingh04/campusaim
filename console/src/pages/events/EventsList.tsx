import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import {
  BlogProps,
  Column,
  DashboardOutletContextProps,
  EventsProps,
} from "../../types/types";
import { DataTable } from "../../ui/tables/DataTable";
import { API } from "../../contexts/API";
import TableButton from "../../ui/button/TableButton";
import { Eye, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Badge from "../../ui/badge/Badge";
import {
  formatDateWithoutTime,
  getErrorResponse,
  getScoreStatus,
  getStatusColor,
  matchPermissions,
} from "../../contexts/Callbacks";
import { Link, useOutletContext } from "react-router-dom";
import { CircularProgress } from "../../ui/progress/CircularProgress";
import TableSkeletonWithOutCards from "../../ui/loadings/pages/TableSkeletonWithOutCards";

export function EventsList() {
  const [allEvents, setEvents] = useState<EventsProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { authUser, authLoading } =
    useOutletContext<DashboardOutletContextProps>();

  const getEvents = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsResult, seoResult] = await Promise.allSettled([
        API.get("/events"),
        API.get("/all/seo?type=event"),
      ]);

      if (eventsResult.status === "fulfilled") {
        let events = eventsResult.value.data;

        if (seoResult.status === "fulfilled") {
          const seoData = seoResult.value.data;

          // Merge seo_score into blogs
          events = events.map((event: any) => {
            const seoMatch = seoData.find(
              (seo: any) => seo.event_id === event._id
            );
            return {
              ...event,
              seo_score: seoMatch ? seoMatch.seo_score : 0,
              event_trend: getScoreStatus(seoMatch ? seoMatch.seo_score : 0),
            };
          });
        }

        setEvents(events);
      }
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getEvents();
  }, [getEvents]);

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
          const response = await API.delete(`/event/${id}`);

          toast.success(response.data.message || "Deleted successfully");
          getEvents();
        }
      } catch (error) {
        getErrorResponse(error);
      }
    },
    [getEvents]
  );

  const columns = useMemo<Column<EventsProps>[]>(
    () => [
      {
        value: (row: EventsProps) => (
          <div>
            <p>{row?.title}</p>
            <span className="text-xs">
              {[
                row?.event_address,
                row?.event_city,
                row?.event_state,
                row?.event_country,
                row?.event_pincode,
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
        ),
        label: "Title",
        key: "title",
        sortingKey: "title",
      },
      {
        value: (row: EventsProps) => (
          <div>
            {!authLoading && (
              <>
                {matchPermissions(authUser?.permissions, "Read Event Seo") ? (
                  <Link to={`/dashboard/event/${row?._id}/seo`}>
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
        value: (row: EventsProps) => (
          <p>{formatDateWithoutTime(row?.schedule?.[0]?.date)}</p>
        ),
        label: "Start Date",
        key: "schedule?.[0]?.date",
        sortingKey: "schedule?.[0]?.date",
      },
      {
        value: (row: EventsProps) => (
          <Badge label={row?.status} color={getStatusColor(row?.status)} />
        ),
        label: "Status",
        key: "status",
        sortingKey: "status",
      },
      {
        label: "Actions",
        value: (row: EventsProps) => (
          <div className="flex space-x-2">
            {!authLoading && (
              <>
                {matchPermissions(authUser?.permissions, "Read Event") && (
                  <TableButton
                    Icon={Eye}
                    color="blue"
                    size="sm"
                    buttontype="link"
                    href={`/dashboard/event/${row._id}`}
                  />
                )}

                {/* {matchPermissions(authUser?.permissions, "Update Event") && (
                  <TableButton
                    Icon={Edit2}
                    color="green"
                    size="sm"
                    buttontype="link"
                    href={`/dashboard/event/${row._id}/edit`}
                  />
                )} */}

                {matchPermissions(authUser?.permissions, "Delete Event") && (
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
          allEvents
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
      {
        label: "Top Event",
        columns: columns.map((c) => c.label),
        filterField: "event_trend" as keyof EventsProps,
        options: uniqueOptions("event_trend"),
      },
    ];
  }, [allEvents, columns]);

  if (loading) {
    return <TableSkeletonWithOutCards />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="All Events"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Events" },
        ]}
        extraButtons={[
          {
            label: "Create Event",
            path: "/dashboard/event/create",
            icon: Plus,
          },
        ]}
      />

      <DataTable<EventsProps>
        data={allEvents}
        columns={columns}
        tabFilters={tabFilters}
      />
    </div>
  );
}
