"use client";

import { PropertyQnaProps } from "@/types/PropertyTypes";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

export default function QnaTab({ qna }: { qna: PropertyQnaProps[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQnA = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      <div className=" w-full p-5 bg-(--primary-bg) text-(--text-color)">
        <div className="space-y-2">
          {qna.map((item, index) => (
            <div key={index} className="rounded-custom">
              <button
                onClick={() => toggleQnA(index)}
                className="flex justify-between items-center w-full p-3 font-medium bg-(--secondary-bg) heading-sm shadow-custom cursor-pointer"
              >
                {item.question}
                {openIndex === index ? (
                  <MinusIcon className="w-5 h-5 text-(--main)" />
                ) : (
                  <PlusIcon className="w-5 h-5 text-(--main)" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 animate-fadeIn paragraph bg-(--secondary-bg) shadow-custom">
                  <ReadMoreLess html={item.answer} enableToggle={false} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
