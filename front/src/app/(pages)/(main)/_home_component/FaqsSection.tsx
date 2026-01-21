"use client";
import { faqsData } from "@/common/Faqs";
import BadgeBorder from "@/ui/badge/BadgeBorder";
import React, { useState } from "react";
import { BiMinus } from "react-icons/bi";
import { BsPlus } from "react-icons/bs";

const FaqsSection = () => {
  const [activeId, setActiveId] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveId(activeId === index ? null : index);
  };

  return (
    <section className="relative  w-full py-10 px-4 sm:px-8 bg-(--primary-bg)">
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-16">
        <div className="lg:sticky lg:top-34 h-fit col-span-2">
          <BadgeBorder label="Your Question. Our Clarity." />

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl font-bold text-(--text-color-emphasis) mb-6">
            Answers To The <br />
            <span className="text-(--main)">
              Most Common <br />
              Questions
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-(--text-color)  max-w-md leading-relaxed">
            As a trusted platform, we understand you have questions before
            diving in. Everything you need to know about our{" "}
            <span className="font-bold">
              verification process, quality assurance, and unique tools
            </span>{" "}
            is answered here.
          </p>
        </div>
        {/* RIGHT COLUMN: The List */}
        <div className="flex flex-col gap-4 lg:gap-12  md:pb-20 col-span-4">
          {faqsData.map((item, index) => (
            <div
              key={index}
              className="group border-b border-(--border) pb-4 lg:border-none lg:pb-0"
            >
              {/* Question Header */}
              {/* Cursor is pointer on mobile (clickable), auto on desktop (not clickable) */}
              <div
                onClick={() => toggleAccordion(index)}
                className="flex items-start justify-between gap-4 cursor-pointer lg:cursor-auto sm:mb-3 mb-1"
              >
                <div className="flex items-start gap-4">
                  <h3
                    className={`text-sm lg:text-xl font-semibold pt-1 transition-colors ${
                      activeId === index
                        ? "text-(--main)"
                        : "text-(--text-color-emphasis) "
                    }`}
                  >
                    <span className="font-bold text-(--main)">Que.</span>{" "}
                    {item.question}
                  </h3>
                </div>

                <div className="lg:hidden text-(--text-color) pt-1">
                  {activeId === index ? (
                    <BiMinus size={20} />
                  ) : (
                    <BsPlus size={20} />
                  )}
                </div>
              </div>

              <div
                className={`${
                  activeId === index ? "block" : "hidden"
                } lg:block `}
              >
                <div className="flex gap-1  text-(--text-color) lg:border-b lg:border-(--border)">
                  <p className="font-bold text-nowrap text-(--main)">Ans.</p>
                  <p className="lg:pb-8 text-lg">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqsSection;
