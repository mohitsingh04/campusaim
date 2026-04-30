"use client";

import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import { PropertyFaqProps, PropertyProps } from "@/types/PropertyTypes";
import TabLoading from "@/ui/loader/component/TabLoading";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { useQuery } from "@tanstack/react-query";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

export default function FaqsTab({
  property,
}: {
  property: PropertyProps | null;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const { data: faqs, isLoading } = useQuery<PropertyFaqProps[]>({
    queryKey: ["property-faqs", property?._id],
    queryFn: async () => {
      if (!property?._id) return [];
      try {
        const response = await API.get(`/property/faq/${property._id}`);
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

  if (!faqs || faqs.length === 0) {
    return (
      <div className="p-5 text-center text-(--text-color-light)">
        No Faqs available.
      </div>
    );
  }

  return (
    <div>
      <div className=" w-full p-5 bg-(--primary-bg) text-(--text-color)">
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="rounded-custom">
              <button
                onClick={() => toggleFAQ(index)}
                className="flex justify-between items-center w-full p-3 font-medium bg-(--secondary-bg) heading-sm shadow-custom cursor-pointer"
              >
                {faq.question}
                {openIndex === index ? (
                  <MinusIcon className="w-5 h-5 text-(--main)" />
                ) : (
                  <PlusIcon className="w-5 h-5 text-(--main)" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 animate-fadeIn paragraph bg-(--secondary-bg) shadow-custom">
                  <ReadMoreLess html={faq.answer} enableToggle={false} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
