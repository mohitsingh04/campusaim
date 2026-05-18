import React from "react";
import HeadingLine from "@/ui/headings/HeadingLine";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { PropertyProps } from "@/types/PropertyTypes";
import TabLoading from "@/ui/loader/component/TabLoading";
import { getErrorResponse } from "@/context/Callbacks";
import API from "@/context/API";
import { useQuery } from "@tanstack/react-query";

interface admissionProcessProps {
  admission_process: string;
}

export default function AdmissionProcessTab({
  property,
}: {
  property: PropertyProps | null;
}) {
  const { data: admissionProcess, isLoading } = useQuery<
    admissionProcessProps[]
  >({
    queryKey: ["admission-process", property?._id],
    queryFn: async () => {
      if (!property?._id) return [];
      try {
        const response = await API.get(`/admission_process/${property._id}`);
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

  if (!admissionProcess || admissionProcess.length === 0) {
    return (
      <div className="p-5 text-center text-(--text-color-light)">
        No Admission process details available.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="p-5 shadow-custom transition">
          <HeadingLine title={`${property?.property_name} Admission Process`} />
          <ReadMoreLess html={admissionProcess[0]?.admission_process} />
        </div>
      </div>
    </div>
  );
}
