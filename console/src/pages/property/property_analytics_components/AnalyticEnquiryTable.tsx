import { useCallback, useEffect, useState } from "react";
import { API } from "../../../contexts/API";
import { Column, SimpleTable } from "../../../ui/tables/SimpleTable";
import { getErrorResponse } from "../../../contexts/Callbacks";
import Skeleton from "react-loading-skeleton";

interface Enquiry {
  name: string;
  email: string;
  contact: string;
  people: number;
  city: string;
  date: string;
}

export default function AnalyticEnquiryTable({ property }: { property: any }) {
  const [enquiry, setEnquiry] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const getEnquiry = useCallback(async () => {
    if (!property?._id) return;
    setLoading(true);
    try {
      const response = await API.get(`/property/enquiry/${property?._id}`);
      setEnquiry(response?.data?.slice(0, 5));
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [property?._id]);

  useEffect(() => {
    getEnquiry();
  }, [getEnquiry]);

  const columns: Column<Enquiry>[] = [
    { label: "Name", value: "name" },
    { label: "Email", value: "email" },
    { label: "Mobile", value: "contact" },
    { label: "People", value: "people" },
    { label: "City", value: "city" },
    {
      label: "Date",
      value: (row) =>
        new Date(row.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
  ];

  if (loading) {
    return <Skeleton height={200} />;
  }

  return (
    <div className="bg-[var(--yp-primary)] rounded-2xl p-5 shadow-sm hover:shadow-md  transition overflow-hidden w-full h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-1 h-4 rounded-full bg-[var(--yp-red-text)]`} />
        <h3 className="text-sm font-medium text-[var(--yp-text-secondary)]">
          Enquiries
        </h3>
      </div>
      <SimpleTable data={enquiry} columns={columns} />
    </div>
  );
}
