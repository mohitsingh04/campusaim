import React, { useState, useMemo, useEffect } from "react";

interface ReadMoreLessProps {
  html: string;
  limit?: number;
  fallbackText?: string;
}

const ReadMoreLessNoBlur: React.FC<ReadMoreLessProps> = ({
  html,
  limit = 100,
  fallbackText = "No content available.",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 🔹 Remove inline styles from all elements
  const cleanHtml = useMemo(() => {
    if (!html || typeof html !== "string") return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const allElements = doc.body.querySelectorAll("*");
    allElements.forEach((el) => {
      el.removeAttribute("style");
    });

    return doc.body.innerHTML.trim();
  }, [html]);

  const plainText = useMemo(() => {
    if (!cleanHtml) return "";
    const div = document.createElement("div");
    div.innerHTML = cleanHtml;
    return div.textContent?.trim() || div.innerText?.trim() || "";
  }, [cleanHtml]);

  const isEmptyContent = !plainText || plainText.length === 0;

  const words = plainText.split(/\s+/);
  const needsTrimming = words.length > limit;

  const visibleText = needsTrimming
    ? words.slice(0, limit).join(" ")
    : plainText;

  const handleToggle = () => setIsExpanded((prev) => !prev);

  useEffect(() => {
    const accordions = document.querySelectorAll<HTMLDivElement>(
      "#blog-main .accordion"
    );

    const handleClick = (accordion: HTMLElement) => {
      const answer = accordion.querySelector<HTMLElement>(".accordion-answer");
      if (!answer) return;

      const isOpen = accordion.classList.contains("active");

      accordions.forEach((acc) => {
        acc.classList.remove("active");
        const otherAnswer = acc.querySelector<HTMLElement>(".accordion-answer");
        if (otherAnswer) otherAnswer.style.display = "none";
      });

      if (!isOpen) {
        accordion.classList.add("active");
        answer.style.display = "block";
      }
    };

    accordions.forEach((accordion) => {
      const question = accordion.querySelector<HTMLElement>(
        ".accordion-question"
      );
      if (question) {
        question.addEventListener("click", () => handleClick(accordion));
      }
    });

    return () => {
      accordions.forEach((accordion) => {
        const question = accordion.querySelector<HTMLElement>(
          ".accordion-question"
        );
        if (question) {
          const clone = question.cloneNode(true);
          question.replaceWith(clone);
        }
      });
    };
  }, [cleanHtml, isExpanded]);

  if (isEmptyContent) {
    return (
      <div className="text-(--yp-text-secondary) italic">{fallbackText}</div>
    );
  }

  return (
    <div className="text-(--text-color) leading-relaxed prose dark:prose-invert max-w-none">
      {!isExpanded ? (
        <span>
          <span>{visibleText}</span>
          {needsTrimming && (
            <button
              onClick={handleToggle}
              className="text-(--main) font-semibold hover:underline focus:outline-none ml-1"
            >
              ...read more
            </button>
          )}
        </span>
      ) : (
        <span>
          <span dangerouslySetInnerHTML={{ __html: cleanHtml }} />{" "}
          <button
            onClick={handleToggle}
            className="text-(--main) font-semibold hover:underline focus:outline-none ml-1"
          >
            show less
          </button>
        </span>
      )}
    </div>
  );
};

export default ReadMoreLessNoBlur;
