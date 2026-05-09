import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { PageTab } from "../../ui/tabs/PageTab";
import Permissions from "./assets/Permissions";

export default function ProfessionalAssets() {
  const tabs = [
    {
      id: "permissions",
      label: "Permissions",
      content: <Permissions />,
    },
  ];
  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="Professional Assets"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Professional Assets" },
        ]}
      />

      <PageTab items={tabs} />
    </div>
  );
}
