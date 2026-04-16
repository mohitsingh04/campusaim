import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function QuestionSteps({
  currentQIndex,
  ADMISSION_QUESTIONS,
  currentQuestion,
  answers,
  handlePrevious,
  handleNext,
  handleOptionSelect,
  isSaving,
}) {
  if (!currentQuestion) {
    return <div className="p-6">Invalid question state.</div>;
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-2 text-[var(--yp-main)] font-semibold tracking-wide text-sm uppercase">
        Question {currentQIndex + 1} of {ADMISSION_QUESTIONS.length}
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-[var(--yp-text-secondary)] mb-3 leading-tight">
        {currentQuestion.title}
      </h1>

      <h3 className="text-lg font-bold text-[var(--yp-text-primary)] mb-3 leading-tight">
        {currentQuestion?.questionText}
      </h3>

      <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-3">
        {currentQuestion.options.map((option) => {
          const isSelected = answers[currentQuestion.id] === option.value;

          return (
            <div
              key={option.value}
              onClick={() =>
                handleOptionSelect(currentQuestion.id, option.value)
              }
              className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group
            ${isSelected
                  ? "border-[var(--yp-main)] bg-[var(--yp-main-subtle)] shadow-sm"
                  : "border-[var(--yp-border-primary)] hover:border-transparent hover:bg-[var(--yp-secondary)]"
                }
          `}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
              ${isSelected
                    ? "border-[var(--yp-main)]"
                    : "border-[var(--yp-muted)] group-hover:border-[var(--yp-main)]"
                  }
            `}
              >
                {isSelected && (
                  <div className="w-3 h-3 bg-[var(--yp-main)] rounded-full" />
                )}
              </div>

              <span
                className={`font-medium ${isSelected
                  ? "text-[var(--yp-main)]"
                  : "text-[var(--yp-text-primary)]"
                  }`}
              >
                {option.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-[var(--yp-border-primary)]">
        <button
          onClick={handlePrevious}
          disabled={currentQIndex === 0}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors
      ${currentQIndex === 0
              ? "text-[var(--yp-muted)] cursor-not-allowed"
              : "text-[var(--yp-text-primary)] hover:bg-[var(--yp-tertiary)]"
            }`}
        >
          <FaChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex gap-3">
          {/* SKIP BUTTON */}
          <button
            onClick={() => handleNext(true)}
            disabled={currentQIndex === 0}
            className={`px-6 py-2.5 rounded-lg font-medium
    ${currentQIndex === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Skip
          </button>

          <button
            onClick={() => handleNext(false)}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-2.5 rounded-lg font-medium transition-all shadow-sm bg-[var(--yp-main)] text-[var(--yp-main-subtle)]"
          >
            Next <FaChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
