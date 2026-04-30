import React from "react";
import HeadingLine from "@/ui/headings/HeadingLine";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { PropertyProps } from "@/types/PropertyTypes";
import { useQuery } from "@tanstack/react-query";
import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import TabLoading from "@/ui/loader/component/TabLoading";

interface loanProcessData {
  loan_process: string;
}

export default function LoanProcessTab({
  property,
}: {
  property: PropertyProps | null;
}) {
  const { data: loanProcess, isLoading } = useQuery<loanProcessData[]>({
    queryKey: ["property-load-process", property?._id],
    queryFn: async () => {
      if (!property?._id) return [];
      try {
        const response = await API.get(`/loan_process/${property._id}`);
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

  if (!loanProcess || loanProcess.length === 0) {
    return (
      <div className="p-5 text-center text-(--text-color-light)">
        No load process details available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="p-5 shadow-custom transition">
          <HeadingLine title={`${property?.property_name} Loan Process`} />
          <ReadMoreLess html={loanProcess[0]?.loan_process} />
        </div>
      </div>
    </div>
  );
}
