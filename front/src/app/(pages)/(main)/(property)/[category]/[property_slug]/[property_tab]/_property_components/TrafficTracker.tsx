"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import API from "@/context/API";
import { getErrorResponse, getSuccessResponse } from "@/context/Callbacks";

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
          getSuccessResponse(res, true);
          hasRun.current = true;
        })
        .catch((error) => getErrorResponse(error, true));
    }
  }, [propertyId, property_tab]);

  return null;
}
