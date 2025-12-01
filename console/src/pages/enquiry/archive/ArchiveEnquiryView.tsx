import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../../../contexts/API";
import ViewSkeleton from "../../../ui/skeleton/ViewSkeleton";
import { Breadcrumbs } from "../../../ui/breadcrumbs/Breadcrumbs";
import { formatDate, getErrorResponse } from "../../../contexts/Callbacks";

// Define TypeScript type for your enquiry data
interface Enquiry {
  _id?: { $oid: string };
  property_name: string;
  property_id: number;
  name: string;
  email: string;
  contact: number;
  people: number;
  date?: { $date: string };
  status: string;
  city: string;
  createdAt?: { $date: string };
  updatedAt?: { $date: string };
  __v?: number;
  [key: string]: any;
}

export default function ArchiveEnquiryView() {
  const { objectId } = useParams<{ objectId: string }>();
  const [data, setData] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);

  // Fields to hide
  const hiddenFields = ["_id", "__v", "property_id", "createdAt", "updatedAt"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get(`/enquiry/archive/${objectId}`);
        setData(res.data);
      } catch (error) {
        getErrorResponse(error, true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [objectId]);

  if (loading) {
    return <ViewSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-700 dark:text-gray-200">
        No data found.
      </div>
    );
  }

  // Filter based on hiddenFields array
  const visibleData = Object.entries(data).filter(
    ([key]) => !hiddenFields.includes(key)
  );

  return (
    <>
      <Breadcrumbs
        title="Archive Enquiry"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Enquiry", path: "/dashboard/enquiry" },
          { label: "Archive", path: "/dashboard/enquiry/archive" },
          { label: data?.property_name },
        ]}
      />
      <div className="overflow-x-auto">
        <table className="w-full bg-[var(--yp-primary)] text-[var(--yp-text-primary)] text-left rounded-lg shadow-md overflow-hidden divide-y divide-[var(--yp-border-primary)]">
          <thead className="bg-[var(--yp-tertiary)] divide-x divide-[var(--yp-border-primary)] text-[var(--yp-muted)]">
            <tr>
              <th className="px-4 py-2 rounded-tl-lg">Field</th>
              <th className="px-4 py-2 rounded-tr-lg">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--yp-border-primary)]">
            {visibleData.map(([key, value]) => (
              <tr
                key={key}
                className="hover:bg-[var(--yp-secondary)] transition-colors divide-x divide-[var(--yp-border-primary)]"
              >
                <td className="px-4 py-2 capitalize">
                  {key.replace(/_/g, " ")}
                </td>
                <td className="px-4 py-2">
                  {key === "date" || key === "createdAt" || key === "updatedAt"
                    ? formatDate(value)
                    : value?.toString() ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
