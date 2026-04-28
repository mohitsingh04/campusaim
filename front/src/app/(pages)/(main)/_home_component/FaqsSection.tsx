"use client";
import { faqsData } from "@/common/Faqs";
import BadgeBorder from "@/ui/badge/BadgeBorder";
import { MinusIcon, PlusIcon } from "lucide-react";
import React, { useState } from "react";

const FaqsSection = () => {
  const [activeId, setActiveId] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveId(activeId === index ? null : index);
  };

  return (
    <section className="relative w-full py-10 px-4 sm:px-8 bg-(--primary-bg)">
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-16">
        <div className="lg:sticky lg:top-34 h-fit col-span-2">
          <BadgeBorder label="Your Question. Our Clarity." />

          <h2 className="text-3xl sm:text-5xl font-bold text-(--text-color-emphasis) mb-6">
            Answers To The <br />
            <span className="text-gradient">
              Most Common <br />
              Questions
            </span>
          </h2>

          <p className="text-xl text-(--text-color) max-w-md leading-relaxed">
            As a trusted platform, we understand you have questions before
            diving in. Everything you need to know about our{" "}
            <span className="font-bold italic">
              verification process, quality assurance, and unique tools
            </span>{" "}
            is answered here.
          </p>
        </div>
        <div className="flex flex-col gap-4 lg:gap-12 md:pb-20 col-span-4">
          {faqsData.map((item, index) => (
            <FaqItem
              key={index}
              item={item}
              index={index}
              isActive={activeId === index}
              onToggle={toggleAccordion}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const FaqItem = React.memo(({ item, index, isActive, onToggle }: any) => {
  return (
    <div className="group border-b border-(--border) pb-4 lg:border-none lg:pb-0">
      <div
        onClick={() => onToggle(index)}
        className="flex items-start justify-between gap-4 cursor-pointer lg:cursor-auto sm:mb-3 mb-1"
      >
        <div className="flex items-start gap-4">
          <h3
            className={`text-sm lg:text-xl font-semibold pt-1 transition-colors duration-200 ${
              isActive ? "text-(--main)" : "text-(--text-color-emphasis)"
            }`}
          >
            <span className="font-bold text-gradient">Que.</span>{" "}
            {item.question}
          </h3>
        </div>

        <div className="lg:hidden text-(--text-color) pt-1">
          {isActive ? <MinusIcon size={20} /> : <PlusIcon size={20} />}
        </div>
      </div>

      <div className={`${isActive ? "block" : "hidden"} lg:block`}>
        <div className="flex gap-1 text-(--text-color) lg:border-b lg:border-(--border)">
          <p className="font-bold text-nowrap text-gradient">Ans.</p>
          <p className="lg:pb-8 text-lg leading-relaxed">{item.answer}</p>
        </div>
      </div>
    </div>
  );
});

FaqItem.displayName = "FaqItem";

export default FaqsSection;
