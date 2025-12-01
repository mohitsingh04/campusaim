import { useEffect, useState, useCallback } from "react";
import { API } from "../../../contexts/API";
import { PropertyProps } from "../../../types/types";
import { AnalyticChart } from "./AnalyticChart";
import { getErrorResponse } from "../../../contexts/Callbacks";
import Skeleton from "react-loading-skeleton";

// Define types
interface TrafficEntry {
  day: string;
  clicks: number;
}

interface EnquiryEntry {
  day: string;
  enquiries: number;
}

interface TrafficDoc {
  daily: TrafficEntry[];
}

interface EnquiryDoc {
  daily: EnquiryEntry[];
}

export default function AnalyticGraph({
  currentProperty,
}: {
  currentProperty: PropertyProps | null;
}) {
  const [traffic, setTraffic] = useState<TrafficEntry[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const getTrafficAndEnquiries = useCallback(async () => {
    if (!currentProperty?.uniqueId) return;

    try {
      const trafficRes = await API.get<TrafficDoc[]>(
        `/property/traffic/${currentProperty._id}`
      );
      const allTrafficDocs = trafficRes.data;

      const enquiryRes = await API.get<EnquiryDoc[]>(
        `/property/enquiry/count/${currentProperty._id}`
      );
      const allEnquiryDocs = enquiryRes.data;

      const trafficDayMap: Record<string, number> = {};
      const enquiryDayMap: Record<string, number> = {};

      allTrafficDocs.forEach((doc: TrafficDoc) => {
        doc.daily.forEach(({ day, clicks }) => {
          if (!trafficDayMap[day]) trafficDayMap[day] = 0;
          trafficDayMap[day] += clicks;
        });
      });

      allEnquiryDocs.forEach((doc: EnquiryDoc) => {
        doc.daily.forEach(({ day, enquiries }) => {
          if (!enquiryDayMap[day]) enquiryDayMap[day] = 0;
          enquiryDayMap[day] += enquiries;
        });
      });

      const mergedTraffic: TrafficEntry[] = Object.entries(trafficDayMap)
        .map(([day, clicks]) => ({ day, clicks }))
        .sort((a, b) => parseInt(a.day) - parseInt(b.day));

      const mergedEnquiries: EnquiryEntry[] = Object.entries(enquiryDayMap)
        .map(([day, enquiries]) => ({ day, enquiries }))
        .sort((a, b) => parseInt(a.day) - parseInt(b.day));

      setTraffic(mergedTraffic);
      setEnquiries(mergedEnquiries);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [currentProperty]);

  useEffect(() => {
    getTrafficAndEnquiries();
  }, [getTrafficAndEnquiries]);

  if (loading) {
    return <Skeleton height={300} />;
  }

  return (
    <div className="bg-[var(--yp-primary)] rounded-2xl p-5 shadow-sm hover:shadow-md  transition overflow-hidden w-full h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-1 h-4 rounded-full bg-[var(--yp-red-text)]`} />
        <h3 className="text-sm font-medium text-[var(--yp-text-secondary)]">
          Traffic & Enquiries (Last Month)
        </h3>
      </div>
      <AnalyticChart trafficData={traffic} enquiryData={enquiries} />
    </div>
  );
}
