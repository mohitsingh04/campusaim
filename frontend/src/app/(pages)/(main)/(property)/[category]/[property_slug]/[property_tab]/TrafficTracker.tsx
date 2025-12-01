"use client";

import { useEffect, useRef } from "react";
import API from "@/contexts/API";
import { useParams } from "next/navigation";

export default function TrafficTracker({
  propertyId,
}: {
  propertyId: number | string;
}) {
  const hasRun = useRef(false);
  const { property_tab } = useParams();

  useEffect(() => {
    if (!propertyId || hasRun.current) return;
    if (property_tab === "overview") {
      API.post("/property/traffic", { property_id: propertyId })
        .then((res) => {
          console.log(res.data.message);
          hasRun.current = true;
        })
        .catch((err) => console.error("Traffic API failed:", err));
    }
  }, [propertyId, property_tab]);

  return null;
}
