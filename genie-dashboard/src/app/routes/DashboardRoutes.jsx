import { Routes, Route, useLocation } from "react-router-dom";
import RouteRenderer from "./RouteRenderer";
import NotFound from "../components/common/pages/404NotFound.jsx";
import { useAuth } from "../context/AuthContext.jsx";

import { adminRoutes } from "./roleRoutes/admin.routes.jsx";
import { partnerRoutes } from "./roleRoutes/partner.routes.jsx";
import { counselorRoutes } from "./roleRoutes/counselor.routes.jsx";
import { superadminRoutes } from "./roleRoutes/superadmin.routes.jsx";
import { teamleaderRoutes } from "./roleRoutes/teamleader.routes.jsx";
import OrganizationRequired from "../components/global/OrganizationRequired.jsx";

const ROUTE_MAP = {
    superadmin: superadminRoutes,
    admin: adminRoutes,
    partner: partnerRoutes,
    counselor: counselorRoutes,
    teamleader: teamleaderRoutes
};

export default function DashboardRoutes({ appRole }) {
    const { authUser, authLoading } = useAuth();
    const location = useLocation();

    if (authLoading) return null;

    const allowedRoutes = [
        "/dashboard/settings", // ✅ allow org creation page
    ];

    const isAllowed = allowedRoutes.some((route) =>
        location.pathname.startsWith(route)
    );

    if (!authUser?.organizationId && !isAllowed && authUser?.appRole !== "superadmin") {
        return <OrganizationRequired />;
    }

    const routes = ROUTE_MAP[appRole];

    if (!routes) {
        console.error("Invalid role:", appRole);

        return (
            <Routes>
                <Route path="*" element={<NotFound />} />
            </Routes>
        );
    }

    return (
        <Routes>
            {RouteRenderer({ routes })}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}