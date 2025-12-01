import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import DashboardSkeleton from "../ui/loadings/pages/DashboardSkeleton";
import { UserProps } from "../types/types";

type PermissionContextProps = {
  children: ReactNode;
  authLoading: boolean;
  authUser: UserProps | null;
  permission?: string | null;
};

export default function PermissionContext({
  children,
  authUser,
  permission,
  authLoading,
}: PermissionContextProps) {
  if (authLoading) {
    return <DashboardSkeleton />;
  }

  if (!authUser) {
    return <Navigate to="/dashboard/access-denied" />;
  }

  if (!permission) {
    return children;
  }

  if (!authUser.permissions?.includes(permission)) {
    return <Navigate to="/dashboard/access-denied" />;
  }

  return children;
}
