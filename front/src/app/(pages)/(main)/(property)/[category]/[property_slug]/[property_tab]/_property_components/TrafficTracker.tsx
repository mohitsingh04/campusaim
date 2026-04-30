"use client";

import { useEffect, useRef } from "react";
import API from "@/context/API";
import { getErrorResponse, getSuccessResponse } from "@/context/Callbacks";

export default function TrafficTracker({
  propertyId,
}: {
  propertyId: number | string;
}) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (!propertyId || hasRun.current) return;
    API.post("/property/traffic", { property_id: propertyId })
      .then((res) => {
        getSuccessResponse(res, true);
        hasRun.current = true;
      })
      .catch((error) => getErrorResponse(error, true));
  }, [propertyId]);

  return null;
}
