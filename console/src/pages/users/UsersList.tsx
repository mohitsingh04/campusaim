import { useState, useMemo, useCallback, useEffect } from "react";
import {
  BadgeCheck,
  BadgeX,
  Eye,
  LucideIcon,
  Pen,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import {
  DashboardOutletContextProps,
  type Column,
  type UserProps,
} from "../../types/types";
import Badge from "../../ui/badge/Badge";
import TableButton from "../../ui/button/TableButton";
import { DataTable } from "../../ui/tables/DataTable";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { API } from "../../contexts/API";
import { useOutletContext } from "react-router-dom";
import {
  getErrorResponse,
  getFieldDataSimple,
  getStatusColor,
  maskSensitive,
  matchPermissions,
} from "../../contexts/Callbacks";
import { colorsData } from "../../common/ExtraData";
import DashboardCard from "../../ui/cards/DashboardCard";
import TableSkeletonWithCards from "../../ui/loadings/pages/TableSkeletonWithCards";

export function UserList() {
  const [users, setUsers] = useState<UserProps[]>([]);
  const { authUser, authLoading, getRoleById } =
    useOutletContext<DashboardOutletContextProps>();

  const [loading, setLoading] = useState(true);

  const getAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get("/profile/users");
      const data = response.data;
      const finalData = data?.map((item: UserProps) => {
        return { ...item, role: getRoleById(item.role) };
      });
      setUsers(finalData);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const roleIcons: LucideIcon[] = [Users, UserCheck, UserPlus, UserMinus];

  const cardData = getFieldDataSimple(users, "role").map((item, index) => ({
    title: item.title,
    value: item.value,
    icon: roleIcons[index % roleIcons.length],
    iconColor: colorsData[index % colorsData.length],
    percentage: Math.round((item?.value / (users.length || 1)) * 100),
  }));

  const columns = useMemo<Column<UserProps>[]>(
    () => [
      {
        value: (row: UserProps) => (
          <div className="flex gap-3">
            <div className="w-10 h-10">
              <img
                src={
                  row?.avatar?.[0]
                    ? row.avatar[0].startsWith("http")
                      ? row.avatar[0]
                      : `${import.meta.env.VITE_MEDIA_URL}/${row.avatar[0]}`
                    : "/img/default-images/yp-user.webp"
                }
                alt={row?.name}
                className="w-10 h-10 rounded-full border border-[var(--yp-border-primary)]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1 items-end">
                <p className="font-semibold">{row?.name}</p>
                {row?.verified ? (
                  <BadgeCheck className="w-4 h-4 text-[var(--yp-green-text)]" />
                ) : (
                  <BadgeX className="w-4 h-4 text-[var(--yp-red-text)]" />
                )}
              </div>
              <p className="text-xs">{maskSensitive(row?.email)}</p>
            </div>
          </div>
        ),
        label: "User",
        key: "user",
        sortingKey: "name",
      },
      {
        value: (row: UserProps) => (
          <p className="lowercase">@{row?.username}</p>
        ),
        label: "Username",
        key: "username",
        sortingKey: "username",
      },
      { value: "role" as keyof UserProps, label: "Role" },
      {
        value: (row: UserProps) => (
          <Badge label={row.status || ""} color={getStatusColor(row?.status)} />
        ),
        label: "Status",
        key: "status",
        sortingKey: "status",
      },
      {
        label: "Actions",
        value: (row: UserProps) => (
          <div className="flex space-x-2">
            {!authLoading && (
              <>
                {matchPermissions(authUser?.permissions, "Read User") && (
                  <TableButton
                    Icon={Eye}
                    color="blue"
                    size="sm"
                    buttontype="link"
                    href={`/dashboard/user/${row._id}`}
                  />
                )}
                {matchPermissions(authUser?.permissions, "Update User") && (
                  <TableButton
                    Icon={Pen}
                    color="green"
                    size="sm"
                    buttontype="link"
                    href={`/dashboard/user/${row._id}/edit`}
                  />
                )}
              </>
            )}
          </div>
        ),
        key: "actions",
      },
    ],
    [authLoading, authUser?.permissions]
  );

  const tabFilters = useMemo(() => {
    const uniqueOptions = (field: keyof UserProps) =>
      Array.from(
        new Set(
          users
            .map((u) => u[field])
            .filter(Boolean)
            .map((v) => String(v))
        )
      );

    return [
      {
        label: "status",
        columns: columns.map((c) => c.label),
        filterField: "status" as keyof UserProps,
        options: uniqueOptions("status"),
      },
      {
        label: "verified",
        columns: columns.map((c) => c.label),
        filterField: "verified" as keyof UserProps,
        options: uniqueOptions("verified"),
      },
      {
        label: "role",
        columns: columns.map((c) => c.label),
        filterField: "role" as keyof UserProps,
        options: uniqueOptions("role"),
      },
    ];
  }, [users, columns]);

  if (loading) {
    return <TableSkeletonWithCards />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="All Users"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Users" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card, index) => (
          <DashboardCard
            key={index}
            title={card?.title}
            value={card?.value}
            iconColor={card?.iconColor}
            percentage={card?.percentage}
            icon={card?.icon}
          />
        ))}
      </div>
      <DataTable<UserProps>
        data={users}
        columns={columns}
        tabFilters={tabFilters}
        includeExportFields={["username", "name", "email", "role", "verified"]}
        searchFields={["name"]}
      />
    </div>
  );
}
