"use client";

import { useEffect, useMemo, useState } from "react";
import { LuMinus, LuPlus } from "react-icons/lu";

type ReadMoreProps = {
  html?: string;
  maxLength?: number;
  enableToggle?: boolean;
};

const DEFAULT_MAX_LENGTH = 350;

/**
 * Removes all inline styles from HTML elements
 */
const sanitizeHtml = (html: string) => {
  if (!html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const allElements = doc.body.querySelectorAll("*");
  allElements.forEach((el) => el.removeAttribute("style"));

  return doc.body.innerHTML.trim();
};

/**
 * Extract plain text from HTML
 */
const stripHtml = (html: string) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent?.trim() || div.innerText?.trim() || "";
};

export function ReadMoreLess({
  html,
  maxLength = DEFAULT_MAX_LENGTH,
  enableToggle = true,
}: ReadMoreProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const cleanedHtml = useMemo(() => sanitizeHtml(html || ""), [html]);

  const plainText = useMemo(() => stripHtml(cleanedHtml), [cleanedHtml]);

  const hasContent = plainText.length > 0;

  const needsTruncation =
    hasContent && enableToggle && plainText.length > maxLength;

  const truncatedText = needsTruncation
    ? plainText.substring(0, maxLength) + "..."
    : plainText;

  const contentToShow =
    needsTruncation && !isExpanded ? truncatedText : cleanedHtml;

  useEffect(() => {
    if (!hasContent) return;

    const accordions = document.querySelectorAll<HTMLDivElement>(
      "#blog-main .accordion"
    );

    const handleClick = (accordion: HTMLElement) => {
      const answer = accordion.querySelector<HTMLElement>(".accordion-answer");
      if (!answer) return;

      const isOpen = accordion.classList.contains("active");

      accordions.forEach((acc) => {
        acc.classList.remove("active");
        const other = acc.querySelector<HTMLElement>(".accordion-answer");
        if (other) other.style.display = "none";
      });

      if (!isOpen) {
        accordion.classList.add("active");
        answer.style.display = "block";
      }
    };

    const cleanupFns: Array<() => void> = [];

    accordions.forEach((accordion) => {
      const question = accordion.querySelector<HTMLElement>(
        ".accordion-question"
      );

      if (question) {
        const handler = () => handleClick(accordion);
        question.addEventListener("click", handler);
        cleanupFns.push(() => question.removeEventListener("click", handler));
      }
    });

    return () => cleanupFns.forEach((fn) => fn());
  }, [hasContent, isExpanded, cleanedHtml]);

  if (!hasContent) return null;

  return (
    <div className="relative">
      <div
        className="text-(--text-color)"
        dangerouslySetInnerHTML={{ __html: contentToShow }}
      />

      {needsTruncation && !isExpanded && (
        <div className="absolute bottom-4 left-0 w-full h-16 bg-linear-to-t from-(--primary-bg) to-transparent pointer-events-none" />
      )}

      {needsTruncation && (
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-1 text-(--main) font-semibold mt-2 hover:opacity-80 relative z-10"
        >
          {isExpanded ? <LuMinus size={12} /> : <LuPlus size={12} />}
          <span>{isExpanded ? "Show less" : "Show more"}</span>
        </button>
      )}
    </div>
  );
}
