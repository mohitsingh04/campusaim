"use client";

import React from "react";
import HeadingLine from "@/ui/headings/HeadingLine";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { PropertyProps } from "@/types/PropertyTypes";
import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import { useQuery } from "@tanstack/react-query";
import TabLoading from "@/ui/loader/component/TabLoading";

interface ScholarshipData {
  scholarship: string;
  _id?: string;
  property_id?: string;
}

export default function ScholarshipTab({
  property,
}: {
  property: PropertyProps | null;
}) {
  const { data: scholarship, isLoading } = useQuery<ScholarshipData[]>({
    queryKey: ["property-scholarship", property?._id],
    queryFn: async () => {
      if (!property?._id) return [];
      try {
        const response = await API.get(`/property-scholarship/${property._id}`);
        return response.data || [];
      } catch (error) {
        getErrorResponse(error, true);
        throw error;
      }
    },
    enabled: !!property?._id,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <TabLoading />;

  if (!scholarship || scholarship.length === 0) {
    return (
      <div className="p-5 text-center text-(--text-color-light)">
        No scholarship details available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="p-5 bg-(--secondary-bg) rounded-custom shadow-custom transition">
          <HeadingLine
            title={`${property?.property_name || "Institute"} Scholarship Details`}
          />
          <div className="mt-4">
            <ReadMoreLess html={scholarship[0]?.scholarship || ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
