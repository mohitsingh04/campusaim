import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import {
  Column,
  DashboardOutletContextProps,
  SupportProps,
  UserProps,
} from "../../types/types";
import { DataTable } from "../../ui/tables/DataTable";
import { API } from "../../contexts/API";
import TableButton from "../../ui/button/TableButton";
import { Eye, MessageCircleQuestion, Trash2 } from "lucide-react";
import {
  getErrorResponse,
  getStatusColor,
  matchPermissions,
} from "../../contexts/Callbacks";
import { useOutletContext } from "react-router-dom";
import Badge from "../../ui/badge/Badge";
import TableSkeletonWithOutCards from "../../ui/loadings/pages/TableSkeletonWithOutCards";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export function SupportList() {
  const [allSupport, setAllSupport] = useState<SupportProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { authUser, authLoading } =
    useOutletContext<DashboardOutletContextProps>();
  const [users, setUsers] = useState<UserProps[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<
    { supportId: string; userId: string; unreadCount: number }[]
  >([]);

  const getUsers = useCallback(async () => {
    try {
      const response = await API.get(`/profile/users`);
      setUsers(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const getUserById = useCallback(
    (id: string) => {
      const found = users.find((item) => Number(item.uniqueId) === Number(id));
      return found;
    },
    [users]
  );

  const getAllSupport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/support");
      let filtered = response.data;
      if (authUser?.role === "Property Manager") {
        filtered = filtered.filter(
          (item: SupportProps) => item?.userId === authUser?.uniqueId
        );
      }
      setAllSupport(filtered);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [authUser?.role, authUser?.uniqueId]);

  useEffect(() => {
    getAllSupport();
  }, [getAllSupport]);

  const getUnreadMessageCount = useCallback(async () => {
    try {
      const response = await API.get(`support/get/unread`);
      setUnreadMessages(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getUnreadMessageCount();
  }, [getUnreadMessageCount]);

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
          const response = await API.delete(`/support/delete/chat/${id}`);

          toast.success(response.data.message || "Deleted successfully");
          getAllSupport();
        }
      } catch (error) {
        getErrorResponse(error);
      }
    },
    [getAllSupport]
  );

  const columns = useMemo<Column<SupportProps>[]>(
    () => [
      {
        value: (row: SupportProps) => (
          <Badge label={row.status || ""} color={getStatusColor(row?.status)} />
        ),
        label: "Status",
        key: "status",
        sortingKey: "status",
      },
      { value: "_id" as keyof SupportProps, label: "Ticket" },
      {
        value: (row: SupportProps) => {
          const count = unreadMessages?.find(
            (item) =>
              item?.supportId === row?._id &&
              item?.userId.toString() !== authUser?.uniqueId.toString()
          )?.unreadCount;

          return (
            <div className="flex items-center gap-2">
              <span>{row?.subject}</span>
              {count && (
                <span className="bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </div>
          );
        },
        label: "Subject",
        key: "status",
        sortingKey: "status",
      },
      {
        value: (row: SupportProps) => <>{getUserById(row?.userId)?.name}</>,
        label: "User",
        key: "user",
        sortingKey: "userId",
      },

      {
        label: "Actions",
        value: (row: SupportProps) => (
          <div className="flex space-x-2">
            {!authLoading && (
              <>
                <TableButton
                  Icon={Eye}
                  color="blue"
                  size="sm"
                  buttontype="link"
                  href={`/dashboard/support/${row._id}`}
                />
                {matchPermissions(authUser?.permissions, "Delete Support") && (
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
    [
      authLoading,
      getUserById,
      authUser?.uniqueId,
      unreadMessages,
      authUser?.permissions,
    ]
  );

  if (loading) {
    return <TableSkeletonWithOutCards />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="All Support"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Support" },
        ]}
        extraButtons={[
          {
            label: "Help & Support",
            path: "/dashboard/support/new",
            icon: MessageCircleQuestion,
          },
        ]}
      />

      <DataTable<SupportProps> data={allSupport} columns={columns} />
    </div>
  );
}
