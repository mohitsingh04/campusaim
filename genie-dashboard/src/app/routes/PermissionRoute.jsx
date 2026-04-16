import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layout/DashboardLayout";

const PermissionRoute = ({ children, requiredPermissions = [] }) => {
    const { authUser, authLoading } = useAuth();

    if (authLoading) return null;

    const userPermissions = authUser?.permission || [];

    const hasPermission = requiredPermissions.every(p =>
        userPermissions.includes(p)
    );

    return hasPermission
        ? children
        :
        children
        // <DashboardLayout>
        //     <div className="p-10 text-red-600 font-bold text-xl">
        //         Permission Denied. Please
        //         <Link to="/support" className="underline text-blue-600 ms-1">
        //             contact support.
        //         </Link>
        //     </div>
        // </DashboardLayout>
        ;
};

export default PermissionRoute;
