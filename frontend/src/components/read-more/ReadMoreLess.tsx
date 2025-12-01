import React, { useState, useMemo, useEffect } from "react";

interface ReadMoreLessProps {
  htmlText: string;
  limit?: number;
  fallbackText?: string;
}

const ReadMoreLess: React.FC<ReadMoreLessProps> = ({
  htmlText,
  limit = 100,
  fallbackText = "No content available.",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const plainText = useMemo(() => {
    if (!htmlText || typeof htmlText !== "string") return "";
    const div = document.createElement("div");
    div.innerHTML = htmlText;
    return div.textContent?.trim() || div.innerText?.trim() || "";
  }, [htmlText]);

  const isEmptyContent = !plainText || plainText.length === 0;

  const words = plainText.trim().split(/\s+/);
  const needsTrimming = words.length > limit;

  const visibleText = needsTrimming
    ? words.slice(0, limit).join(" ")
    : plainText;

  const handleToggle = () => setIsExpanded(!isExpanded);

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
        if (otherAnswer) {
          otherAnswer.style.display = "none";
        }
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
  }, [htmlText, isExpanded]);

  // 🧩 Show fallback if content is empty
  if (isEmptyContent) {
    return <div className="text-gray-700 italic">{fallbackText}</div>;
  }

  return (
    <div className="text-gray-700 leading-relaxed prose dark:prose-invert max-w-none">
      {!isExpanded ? (
        <span>
          <span>{visibleText}</span>
          {needsTrimming && (
            <button
              onClick={handleToggle}
              className="text-blue-500 font-semibold hover:underline focus:outline-none ml-1"
            >
              ...read more
            </button>
          )}
        </span>
      ) : (
        <span>
          <span dangerouslySetInnerHTML={{ __html: htmlText }} />{" "}
          <button
            onClick={handleToggle}
            className="text-blue-500 font-semibold hover:underline focus:outline-none ml-1"
          >
            show less
          </button>
        </span>
      )}
    </div>
  );
};

export default ReadMoreLess;
