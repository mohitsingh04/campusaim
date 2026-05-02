"use client";

import { FaqProps } from "@/types/Types";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { ReadMoreLess } from "../texts/ReadMoreLess";

export default function FaqComponents({ faqs }: { faqs: FaqProps[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="w-full space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = activeIndex === index;
        return (
          <div key={index} className="overflow-hidden">
            <button
              onClick={() => toggleFaq(index)}
              className="w-full flex items-center justify-between p-5 cursor-pointer list-none bg-(--secondary-bg) rounded-custom transition-colors text-left"
              aria-expanded={isOpen}
            >
              <span className="text-lg font-medium text-(--text-color-emphasis)">
                {faq.question}
              </span>
              <span
                className={`transition-transform duration-300 text-(--text-color) ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                <ChevronDown />
              </span>
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 pt-4">
                  <ReadMoreLess html={faq?.answer} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
