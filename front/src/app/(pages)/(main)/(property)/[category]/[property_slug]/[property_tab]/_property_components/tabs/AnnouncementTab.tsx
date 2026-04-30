import React from "react";
import HeadingLine from "@/ui/headings/HeadingLine";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { PropertyProps } from "@/types/PropertyTypes";
import TabLoading from "@/ui/loader/component/TabLoading";
import { useQuery } from "@tanstack/react-query";
import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";

interface announcementData {
  announcement: string;
}
export default function AnnouncementTab({
  property,
}: {
  property: PropertyProps | null;
}) {
  const { data: announcement, isLoading } = useQuery<announcementData[]>({
    queryKey: ["property-announcement", property?._id],
    queryFn: async () => {
      if (!property?._id) return [];
      try {
        const response = await API.get(`/announcement/${property._id}`);
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

  if (!announcement || announcement.length === 0) {
    return (
      <div className="p-5 text-center text-(--text-color-light)">
        No Announcement available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="p-5 shadow-custom transition">
          <HeadingLine title={`${property?.property_name} Announcements`} />
          <ReadMoreLess html={announcement[0]?.announcement} />
        </div>
      </div>
    </div>
  );
}
