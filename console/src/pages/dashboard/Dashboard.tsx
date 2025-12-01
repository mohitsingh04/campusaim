import { Plus } from "lucide-react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import SuperAdminDashboard from "./role-based-dashboard/SuperAdminDashboard";

export function Dashboard() {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="Dashboard"
        breadcrumbs={[{ label: "Dashboard" }]}
        extraButtons={[
          {
            label: "Add Property",
            path: "/dashboard/property/create",
            icon: Plus,
          },
        ]}
      />
      <SuperAdminDashboard />
    </div>
  );
}
