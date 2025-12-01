import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import {
  Column,
  DashboardOutletContextProps,
  FeedbackProps,
  UserProps,
} from "../../types/types";
import { DataTable } from "../../ui/tables/DataTable";
import { API } from "../../contexts/API";
import TableButton from "../../ui/button/TableButton";
import { Eye, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { getErrorResponse, matchPermissions } from "../../contexts/Callbacks";
import { useOutletContext } from "react-router-dom";
import { FeedbackData } from "../../common/FeedbackData";
import TableSkeletonWithOutCards from "../../ui/loadings/pages/TableSkeletonWithOutCards";

export function FeedbackList() {
  const [allFeedbacks, setAllFeedbacks] = useState<FeedbackProps[]>([]);
  const [users, setAllUsers] = useState<UserProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { authUser, authLoading } =
    useOutletContext<DashboardOutletContextProps>();

  const getAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/profile/users");
      const data = response.data;
      setAllUsers(data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const getUserById = useCallback(
    (id: string) => {
      return (
        users.find((user) => user.uniqueId === Number(id))?.name || "Unknown"
      );
    },
    [users]
  );

  const getAllFeedbacks = useCallback(async () => {
    try {
      const response = await API.get("/feedback");
      const data = response.data;

      const finalData = data.map((feedback: any) => ({
        _id: feedback._id,
        status: feedback.status,
        createdAt: feedback.createdAt,
        reaction: feedback.reaction,
        user: getUserById(feedback.userId),
      }));
      setAllFeedbacks(finalData);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [getUserById]);

  useEffect(() => {
    getAllFeedbacks();
  }, [getAllFeedbacks]);

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
          const response = await API.delete(`/feedback/${id}`);

          toast.success(response.data.message || "Deleted successfully");
          getAllFeedbacks();
        }
      } catch (error) {
        getErrorResponse(error);
      }
    },
    [getAllFeedbacks]
  );

  const columns = useMemo<Column<FeedbackProps>[]>(
    () => [
      {
        value: (row: FeedbackProps) => {
          const rating = FeedbackData.find((r) => r.label === row.reaction);

          return (
            <div className="flex">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div
                  className={`p-3 rounded-full shadow-inner flex items-center justify-center ${
                    rating ? rating.bg : "bg-[var(--yp-muted)]"
                  }`}
                >
                  {rating ? (
                    <rating.icon className={`w-6 h-6 ${rating.color}`} />
                  ) : (
                    <span className="bg-[var(--yp-muted)]">?</span>
                  )}
                </div>
              </div>
            </div>
          );
        },
        label: "Reaction",
        sortingKey: "reaction",
      },
      { value: "reaction" as keyof FeedbackProps, label: "Feedback" },
      { value: "user" as keyof FeedbackProps, label: "User" },

      {
        label: "Actions",
        value: (row: FeedbackProps) => (
          <div className="flex space-x-2">
            {!authLoading && (
              <>
                {matchPermissions(authUser?.permissions, "Read Feedback") && (
                  <TableButton
                    Icon={Eye}
                    color="blue"
                    size="sm"
                    buttontype="link"
                    href={`/dashboard/feedback/${row._id}`}
                  />
                )}

                {matchPermissions(authUser?.permissions, "Delete Feedback") && (
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
    const uniqueOptions = (field: keyof FeedbackProps) =>
      Array.from(
        new Set(
          allFeedbacks
            .map((u) => u[field])
            .filter(Boolean)
            .map((v) => String(v))
        )
      );

    return [
      {
        label: "Status",
        columns: columns.map((c) => c.label),
        filterField: "status" as keyof FeedbackProps,
        options: uniqueOptions("status"),
      },
    ];
  }, [allFeedbacks, columns]);

  if (loading) {
    return <TableSkeletonWithOutCards />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="All Feedbacks"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "feedbacks" },
        ]}
      />

      <DataTable<FeedbackProps>
        data={allFeedbacks}
        columns={columns}
        tabFilters={tabFilters}
      />
    </div>
  );
}
