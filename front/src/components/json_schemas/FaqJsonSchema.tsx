import { stripHtml } from "@/context/Callbacks";
import { FaqProps } from "@/types/Types";
import Script from "next/script";
import React from "react";

export default function FaqJsonSchema({
  faqs,
  slug,
}: {
  faqs: FaqProps[];
  slug: string;
}) {
  const faqSchema =
    faqs?.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs?.map((faq: any) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: stripHtml(faq.answer),
            },
          })),
        }
      : null;
  return (
    <div>
      {faqSchema && (
        <Script
          id={`json-ld-faq-${slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </div>
  );
}
