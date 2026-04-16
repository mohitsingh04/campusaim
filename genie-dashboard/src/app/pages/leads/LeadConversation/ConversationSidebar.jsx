import HeadingLine from "../../../components/ui/HeadingLine/HeadingLine";
import {
  LuCircle,
  LuCircleAlert,
  LuCircleCheck,
  LuStickyNote,
  LuFileText,
} from "react-icons/lu";

export default function ConversationSidebar({
  progressPercentage,
  answeredCount,
  ADMISSION_QUESTIONS,
  answers,
  maxAnsweredIndex,
  currentQIndex,
  isStarted,
  hasHistory,
  isNoteStep,
  isSummaryStep,
  note,
  setIsStarted,
  setCurrentQIndex,
  NOTE_STEP_INDEX,
  SUMMARY_STEP_INDEX,
  isConversationStopped
}) {
  return (
    <div className="w-full md:w-1/4 border-r border-[var(--yp-border-primary)] flex flex-col">
      <div className="p-5 border-b border-[var(--yp-border-primary)]">
        <HeadingLine title="Checklist" />

        <div className="mt-3 w-full bg-[var(--yp-tertiary)] rounded-full h-2">
          <div
            className="bg-[var(--yp-main)] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <p className="text-xs text-[var(--yp-muted)] mt-1 text-right">
          {answeredCount}/{ADMISSION_QUESTIONS.length} Completed
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[calc(100vh-250px)]">
        {ADMISSION_QUESTIONS.map((q, idx) => {
          const isAnswered = !!answers[String(q.id)];
          const isSkipped = !isAnswered && idx < maxAnsweredIndex;
          const isActive = isStarted && currentQIndex === idx;
          const isClickable =
            (isStarted || hasHistory) && !isConversationStopped;

          return (
            <button
              key={q.id}
              disabled={!isClickable}
              onClick={() => {
                if (isConversationStopped) return;
                setIsStarted(true);
                setCurrentQIndex(idx);
              }}
              className={`w-full text-left p-3 rounded-lg text-sm flex text-[var(--yp-text-secondary)] items-center justify-between transition-all
            ${isActive
                  ? "bg-[var(--yp-secondary)] shadow-sm border-l-4 border-[var(--yp-main)]"
                  : "hover:bg-[var(--yp-tertiary)]"
                }
            ${!isClickable ? "opacity-50 cursor-not-allowed" : ""}
          `}
            >
              <span
                className={`font-medium truncate mr-2 ${isSkipped ? "opacity-70 text-[var(--yp-muted)]" : ""
                  }`}
              >
                {idx + 1}. {q.title}
              </span>

              {isAnswered ? (
                <LuCircleCheck className="w-4 h-4 text-[var(--yp-success)] shrink-0" />
              ) : isSkipped ? (
                <LuCircleAlert
                  className="w-4 h-4 text-[var(--yp-warning)] shrink-0"
                  title="Skipped"
                />
              ) : (
                <LuCircle
                  className={`w-4 h-4 shrink-0 ${isActive
                    ? "text-[var(--yp-main)]"
                    : "text-[var(--yp-muted)]"
                    }`}
                />
              )}
            </button>
          );
        })}

        {/* Note Step */}
        <button
          disabled={(!isStarted && !hasHistory) || isConversationStopped}
          onClick={() => {
            setIsStarted(true);
            setCurrentQIndex(NOTE_STEP_INDEX);
          }}
          className={`w-full text-left p-3 rounded-lg text-sm flex text-[var(--yp-text-secondary)] items-center justify-between transition-all
        ${isNoteStep
              ? "bg-[var(--yp-secondary)] shadow-sm border-l-4 border-[var(--yp-main)]"
              : "hover:bg-[var(--yp-tertiary)]"
            }
        ${!isStarted && !hasHistory ? "opacity-50 cursor-not-allowed" : ""}
      `}
        >
          <span className="font-medium truncate mr-2">Final Notes</span>

          {note ? (
            <LuCircleCheck className="w-4 h-4 text-[var(--yp-success)] shrink-0" />
          ) : (
            <LuStickyNote
              className={`w-4 h-4 shrink-0 ${isNoteStep
                ? "text-[var(--yp-main)]"
                : "text-[var(--yp-muted)]"
                }`}
            />
          )}
        </button>

        {/* Summary Step */}
        <button
          disabled={(!isStarted && !hasHistory) || isConversationStopped}
          onClick={() => {
            setIsStarted(true);
            setCurrentQIndex(SUMMARY_STEP_INDEX);
          }}
          className={`w-full text-left p-3 rounded-lg text-sm flex text-[var(--yp-text-secondary)] items-center justify-between transition-all
        ${isSummaryStep
              ? "bg-[var(--yp-secondary)] shadow-sm border-l-4 border-[var(--yp-main)]"
              : "hover:bg-[var(--yp-tertiary)]"
            }
        ${!isStarted && !hasHistory ? "opacity-50 cursor-not-allowed" : ""}
      `}
        >
          <span className="font-medium truncate mr-2">Summary</span>

          <LuFileText
            className={`w-4 h-4 shrink-0 ${isSummaryStep
              ? "text-[var(--yp-main)]"
              : "text-[var(--yp-muted)]"
              }`}
          />
        </button>
      </div>
    </div>
  );
}
