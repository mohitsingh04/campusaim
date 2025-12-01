import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { PageTab } from "../../ui/tabs/PageTab";
import { ProfessionalLanguages } from "./assets/Languages";
import Permissions from "./assets/Permissions";
import { ProfessionalSkills } from "./assets/Skills";

export default function ProfessionalAssets() {
  const tabs = [
    {
      id: "skills",
      label: "Skills",
      content: <ProfessionalSkills />,
    },
    {
      id: "languages",
      label: "Languages",
      content: <ProfessionalLanguages />,
    },
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
