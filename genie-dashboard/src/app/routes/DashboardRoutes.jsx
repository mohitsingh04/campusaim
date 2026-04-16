import { Routes, Route } from "react-router-dom";
import RouteRenderer from "./RouteRenderer";
import NotFound from "../components/common/pages/404NotFound.jsx";

import { adminRoutes } from "./roleRoutes/admin.routes.jsx";
import { partnerRoutes } from "./roleRoutes/partner.routes.jsx";
import { counselorRoutes } from "./roleRoutes/counselor.routes.jsx";
import { superadminRoutes } from "./roleRoutes/superadmin.routes.jsx";
import { teamleaderRoutes } from "./roleRoutes/teamleader.routes.jsx";

const ROUTE_MAP = {
    superadmin: superadminRoutes,
    admin: adminRoutes,
    partner: partnerRoutes,
    counselor: counselorRoutes,
    teamleader: teamleaderRoutes
};

export default function DashboardRoutes({ role }) {
    const routes = ROUTE_MAP[role] || [];

    return (
        <Routes>
            {RouteRenderer({ routes })}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
