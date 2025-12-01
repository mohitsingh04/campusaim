import { useEffect, useState } from "react";
import { Tag, User, FileText } from "lucide-react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { useOutletContext, useParams } from "react-router-dom";
import { DashboardOutletContextProps, StatusProps } from "../../types/types";
import ViewSkeleton from "../../ui/skeleton/ViewSkeleton";
import ReadMoreLess from "../../ui/read-more/ReadMoreLess";
import Badge from "../../ui/badge/Badge";

export default function StatusView() {
  const { objectId } = useParams();
  const [loading, setLoading] = useState(true);
  const { status } = useOutletContext<DashboardOutletContextProps>();
  const [mainStatus, setMainStatus] = useState<StatusProps | null>(null);

  useEffect(() => {
    setLoading(true);
    if (status?.length > 0) {
      const found = status.find((item) => item?._id === objectId) || null;
      setMainStatus(found);
      setLoading(false);
    } else {
      setMainStatus(null);
    }
  }, [objectId, status]);

  if (loading) {
    return <ViewSkeleton />;
  }

  const data = [
    {
      label: "name",
      value: mainStatus?.name || "",
      icon: <Tag className="w-4 h-4 text-blue-500" />,
      color: "blue",
    },
    {
      label: "parent_status",
      value: mainStatus?.parent_status || "",
      icon: <User className="w-4 h-4 text-green-500" />,
      color: "green",
    },
    {
      label: "description",
      value: mainStatus?.description || "",
      icon: <FileText className="w-4 h-4 text-gray-500" />,
      color: "gray",
    },
  ];

  return (
    <div>
      <Breadcrumbs
        title="Status View"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Status", path: "/dashboard/status" },
          { label: mainStatus?.name || "" },
        ]}
      />

      {/* Table for Desktop */}
      <div className="hidden mt-4 sm:block bg-[var(--yp-primary)] shadow-sm rounded-2xl overflow-hidden transition-colors mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--yp-border-primary)] text-sm sm:text-base">
            <thead className="bg-[var(--yp-primary)]">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-[var(--yp-muted)] w-1/4 uppercase tracking-wide">
                  Field
                </th>
                <th className="px-6 py-3 text-left font-semibold text-[var(--yp-muted)] uppercase tracking-wide">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--yp-border-primary)]">
              {data.map((item) => (
                <tr
                  key={item.label}
                  className="hover:bg-[var(--yp-tertiary)] transition"
                >
                  <td className="px-6 py-4 font-medium text-[var(--yp-text-primary)] flex items-center gap-2">
                    {item.icon} {item.label}
                  </td>
                  <td className="px-6 py-4">
                    {item.label === "description" ? (
                      <ReadMoreLess children={item?.value} />
                    ) : (
                      <Badge label={item.value} color={item?.color} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sm:hidden space-y-4">
        {data.map((item) => (
          <div
            key={item.label}
            className="bg-[var(--yp-primary)] p-4 rounded-2xl shadow-sm  transition-colors"
          >
            <div className="flex items-center gap-2 font-medium capitalize text-[var(--yp-text-primary)] mb-2">
              {item.icon} {item.label}
            </div>
            <div className="text-[var(--yp-text-secondary)] text-sm">
              {item.label === "description" ? (
                <ReadMoreLess children={item?.value} />
              ) : (
                <Badge label={item.value} color={item?.color} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
