"use client";

import { PropertyFaqProps } from "@/types/PropertyTypes";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { useState } from "react";
import { LuMinus, LuPlus } from "react-icons/lu";

export default function FaqsTab({ faqs }: { faqs: PropertyFaqProps[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
                  <LuMinus className="w-5 h-5 text-(--main)" />
                ) : (
                  <LuPlus className="w-5 h-5 text-(--main)" />
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
