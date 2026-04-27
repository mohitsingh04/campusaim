"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import "@/css/Blogs.css";

interface ReadMoreLessProps {
  html: string;
  limit?: number;
  maxHeight?: number;
  fallbackText?: string;
  className?: string;
  readText?: string;
  collapseText?: string;
  enableToggle?: boolean;
}

export const ReadMoreLess: React.FC<ReadMoreLessProps> = ({
  html = "",
  limit = 100,
  maxHeight = 150,
  fallbackText = "No content available.",
  className = "",
  readText = "Read Full Details",
  collapseText = "Collapse Details",
  enableToggle = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldTrim, setShouldTrim] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const cleanHtml = useMemo(() => {
    if (!html) return "";
    return html.replace(/style="[^"]*"/gi, "");
  }, [html]);

  // Calculate trimming on the client side only to avoid SSR ReferenceErrors
  useEffect(() => {
    if (!enableToggle || !cleanHtml || typeof window === "undefined") {
      setShouldTrim(false);
      return;
    }

    const div = document.createElement("div");
    div.innerHTML = cleanHtml;
    const text = div.textContent?.trim() || div.innerText?.trim() || "";
    const wordCount = text.split(/\s+/).length;
    
    setShouldTrim(wordCount > limit);
  }, [cleanHtml, limit, enableToggle]);

  useEffect(() => {
    if (!cleanHtml || typeof window === "undefined") return;

    const accordions = document.querySelectorAll<HTMLDivElement>(
      "#blog-main .accordion",
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
        ".accordion-question",
      );

      if (question) {
        const handler = () => handleClick(accordion);
        question.addEventListener("click", handler);
        cleanupFns.push(() => question.removeEventListener("click", handler));
      }
    });

    return () => cleanupFns.forEach((fn) => fn());
  }, [cleanHtml, isExpanded]);

  const isEmptyContent = !cleanHtml || cleanHtml.length === 0;

  if (isEmptyContent) {
    return (
      <div className="text-(--text-color) italic text-sm">{fallbackText}</div>
    );
  }

  return (
    <div id="blog-main" className={`leading-relaxed text-sm ${className}`}>
      <div
        className="relative overflow-hidden transition-all duration-700 ease-in-out"
        style={{
          maxHeight: shouldTrim
            ? isExpanded
              ? "100000px"
              : `${maxHeight}px`
            : "none",
        }}
      >
        <div ref={containerRef} className="relative">
          <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
        </div>

        {shouldTrim && !isExpanded && (
          <div className="absolute bottom-0 left-0 w-full h-16 bg-linear-to-t from-(--primary-bg) via-(--primary-bg)/90 to-transparent pointer-events-none" />
        )}
      </div>

      {shouldTrim && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-gradient font-semibold mt-2 hover:opacity-80 relative z-10 cursor-pointer"
        >
          {isExpanded ? collapseText : readText}
          {isExpanded ? (
            <ChevronUp className="transition-transform text-(--main)" />
          ) : (
            <ChevronDown className="transition-transform text-(--main)" />
          )}
        </button>
      )}
    </div>
  );
};