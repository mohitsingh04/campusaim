import React, { useState } from "react";
import { LuMinus, LuPlus } from "react-icons/lu";
import { AnimatePresence, motion } from "framer-motion";
import { FaqProps } from "@/types/types";

export default function FaqsTab({ faqs }: { faqs: FaqProps[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="p-6">
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-xl shadow-xs bg-gray-50 hover:shadow-sm transition-all duration-300"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="flex justify-between items-center w-full p-4 text-left font-medium text-gray-800 hover:bg-gray-50 rounded-xl"
            >
              {faq.question}

              <motion.div
                initial={false}
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {openIndex === index ? (
                  <LuMinus className="w-5 h-5 text-purple-600" />
                ) : (
                  <LuPlus className="w-5 h-5 text-purple-600" />
                )}
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {openIndex === index && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                    className="px-4 pb-4 text-gray-600"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
