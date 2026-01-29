// import React, { useState, useMemo, useEffect } from "react";

// interface ReadMoreLessProps {
//   children: string;
//   limit?: number;
//   fallbackText?: string;
// }

// const ReadMoreLess: React.FC<ReadMoreLessProps> = ({
//   children,
//   limit = 100,
//   fallbackText = "No content available.",
// }) => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   const plainText = useMemo(() => {
//     if (!children || typeof children !== "string") return "";
//     const div = document.createElement("div");
//     div.innerHTML = children;
//     return div.textContent?.trim() || div.innerText?.trim() || "";
//   }, [children]);

//   const isEmptyContent = !plainText || plainText.length === 0;

//   const words = plainText.trim().split(/\s+/);
//   const needsTrimming = words.length > limit;

//   const visibleText = needsTrimming
//     ? words.slice(0, limit).join(" ")
//     : plainText;

//   const handleToggle = () => setIsExpanded(!isExpanded);

//   useEffect(() => {
//     const accordions = document.querySelectorAll<HTMLDivElement>(
//       "#blog-main .accordion"
//     );

//     const handleClick = (accordion: HTMLElement) => {
//       const answer = accordion.querySelector<HTMLElement>(".accordion-answer");
//       if (!answer) return;

//       const isOpen = accordion.classList.contains("active");

//       accordions.forEach((acc) => {
//         acc.classList.remove("active");
//         const otherAnswer = acc.querySelector<HTMLElement>(".accordion-answer");
//         if (otherAnswer) {
//           otherAnswer.style.display = "none";
//         }
//       });

//       if (!isOpen) {
//         accordion.classList.add("active");
//         answer.style.display = "block";
//       }
//     };

//     accordions.forEach((accordion) => {
//       const question = accordion.querySelector<HTMLElement>(
//         ".accordion-question"
//       );
//       if (question) {
//         question.addEventListener("click", () => handleClick(accordion));
//       }
//     });

//     return () => {
//       accordions.forEach((accordion) => {
//         const question = accordion.querySelector<HTMLElement>(
//           ".accordion-question"
//         );
//         if (question) {
//           const clone = question.cloneNode(true);
//           question.replaceWith(clone);
//         }
//       });
//     };
//   }, [children, isExpanded]);

//   // 🧩 Show fallback if content is empty
//   if (isEmptyContent) {
//     return (
//       <div className="text-[var(--yp-text-secondary)] italic">
//         {fallbackText}
//       </div>
//     );
//   }

//   return (
//     <div id="blog-main" className="text-[var(--yp-text-primary)] leading-relaxed prose dark:prose-invert max-w-none">
//       {!isExpanded ? (
//         <span>
//           <span>{visibleText}</span>
//           {needsTrimming && (
//             <button
//               onClick={handleToggle}
//               className="text-[var(--yp-main)] font-semibold hover:underline focus:outline-none ml-1"
//             >
//               ...Read More
//             </button>
//           )}
//         </span>
//       ) : (
//         <span>
//           <span dangerouslySetInnerHTML={{ __html: children }} />{" "}
//           <button
//             onClick={handleToggle}
//             className="text-[var(--yp-main)] font-semibold hover:underline focus:outline-none ml-1"
//           >
//             Show Less
//           </button>
//         </span>
//       )}
//     </div>
//   );
// };

// export default ReadMoreLess;
import React, { useState, useEffect, useMemo } from "react";

interface ReadMoreLessProps {
	children: string;
	previewLines?: number; // visual clamp lines
	fallbackText?: string;
}

const ReadMoreLess: React.FC<ReadMoreLessProps> = ({
	children,
	previewLines = 6,
	fallbackText = "No content available.",
}) => {
	const [isExpanded, setIsExpanded] = useState(false);

	/* -------------------------------------------------------
     BASIC CONTENT VALIDATION
  ------------------------------------------------------- */
	const isEmptyContent = useMemo(() => {
		if (!children || typeof children !== "string") return true;
		return children.replace(/<[^>]*>/g, "").trim().length === 0;
	}, [children]);

	/* -------------------------------------------------------
     ACCORDION HANDLER (EVENT DELEGATION)
  ------------------------------------------------------- */
	useEffect(() => {
		const container = document.getElementById("blog-main");
		if (!container) return;

		const handleClick = (e: Event) => {
			const target = e.target as HTMLElement;
			const question = target.closest(".accordion-question");
			if (!question) return;

			const accordion = question.closest(".accordion");
			if (!accordion) return;

			const answer = accordion.querySelector<HTMLElement>(".accordion-answer");
			if (!answer) return;

			const isOpen = accordion.classList.contains("active");

			container.querySelectorAll(".accordion").forEach((acc) => {
				acc.classList.remove("active");
				const ans = acc.querySelector<HTMLElement>(".accordion-answer");
				if (ans) ans.style.display = "none";
			});

			if (!isOpen) {
				accordion.classList.add("active");
				answer.style.display = "block";
			}
		};

		container.addEventListener("click", handleClick);
		return () => container.removeEventListener("click", handleClick);
	}, []);

	/* -------------------------------------------------------
     FALLBACK
  ------------------------------------------------------- */
	if (isEmptyContent) {
		return (
			<div className="text-[var(--yp-text-secondary)] italic">
				{fallbackText}
			</div>
		);
	}

	/* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */
	return (
		<div
			id="blog-main"
			className="text-[var(--yp-text-primary)] leading-relaxed max-w-none"
		>
			{/* CONTENT */}
			<div
				className={!isExpanded ? "blog-preview-clamp" : undefined}
				style={
					!isExpanded
						? {
								display: "-webkit-box",
								WebkitLineClamp: previewLines,
								WebkitBoxOrient: "vertical",
								overflow: "hidden",
							}
						: undefined
				}
				dangerouslySetInnerHTML={{ __html: children }}
			/>

			{/* TOGGLE */}
			<button
				onClick={() => setIsExpanded((prev) => !prev)}
				className="mt-2 text-[var(--yp-main)] font-semibold hover:underline focus:outline-none"
				type="button"
			>
				{isExpanded ? "Show Less" : "Read More"}
			</button>
		</div>
	);
};

export default ReadMoreLess;
