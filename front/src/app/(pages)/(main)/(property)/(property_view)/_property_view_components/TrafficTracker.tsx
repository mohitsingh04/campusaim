"use client";

import { useEffect, useRef } from "react";
import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";

export default function TrafficTracker({ propertyId }: { propertyId: string }) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (!propertyId || hasRun.current) return;

    hasRun.current = true;

    API.post("/property/traffic", {
      property_id: propertyId,
    }).catch((error) => {
      getErrorResponse(error, true);
    });
  }, [propertyId]);

  return null;
}
