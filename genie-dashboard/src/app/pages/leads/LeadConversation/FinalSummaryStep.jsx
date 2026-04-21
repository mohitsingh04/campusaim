import { useCallback, useMemo } from "react";
import { FaChevronLeft } from "react-icons/fa";
import {
  LuCircleCheck,
  LuLoader,
  LuListChecks,
  LuCalendarClock,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Badge from "../../../components/ui/Badge/Badge";
import { useAuth } from "../../../context/AuthContext";
import { API } from "../../../services/API";
import { FeedbackData } from "../../../common/FeedbackData/FeedbackData";
import { SimpleTable } from "../../../components/ui/Table/SimpleTable";

export default function FinalSummaryStep({
  answers,
  questions,
  note,
  handlePrevious,
  isSaving,
  lead,
  setIsSaving,
  rating,
  nextFollowUpDate,
  nextFollowUpTime,

  pitchSummary,
  courseSuggested,
  collegesSuggested,
  studentObjections,
  nextAction,
}) {
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const normalizedCourses = Array.isArray(courseSuggested)
    ? courseSuggested.flatMap(c => String(c).split(",").map(v => v.trim()))
    : [];

  const totalQuestions = questions.length;
  const submittedCount = Object.keys(answers).length;

  const isAdmin =
    authUser?.role === "admin" || authUser?.role === "superadmin";

  // --- Score Calculations ---
  const overallAnswerScore = useMemo(() => {
    return Object.entries(answers).reduce((sum, [qId, ans]) => {
      const question = questions.find((q) => String(q.id) === String(qId));
      const option = question?.options.find((o) => o.value === ans);
      return sum + (option?.point || 0);
    }, 0);
  }, [answers, questions]);

  const overallLeadScore = useMemo(() => {
    if (!totalQuestions) return 0;

    const answeredCountSafe = Math.max(submittedCount, 1); // avoid divide-by-zero

    // Same normalization as backend
    const maxPossible = totalQuestions;
    const answerScorePct =
      ((overallAnswerScore + maxPossible) / (2 * maxPossible)) * 100;

    const ratingPct = (Number(rating) / 5) * 100;

    const completionPct =
      (submittedCount / totalQuestions) * 100;

    return Number(
      (
        answerScorePct * 0.5 +   // 50%
        ratingPct * 0.3 +        // 30%
        completionPct * 0.2      // 20%
      ).toFixed(2)
    );
  }, [submittedCount, totalQuestions, rating, overallAnswerScore]);

  // --- Helpers ---
  const getAnswerLabel = (questionId, value) => {
    const question = questions.find(q => String(q.id) === String(questionId));
    const option = question?.options.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getAnswerPoint = (questionId, value) => {
    const question = questions.find(q => String(q.id) === String(questionId));
    const option = question?.options.find(opt => opt.value === value);
    return option?.point ?? 0;
  };

  // --- Submission ---
  const submitConversation = useCallback(async () => {
    try {
      setIsSaving(true);

      const formattedQuestions = Object.entries(answers).map(([qId, ans]) => {
        const questionObj = questions.find(
          (q) => String(q.id) === String(qId)
        );
        const selectedOption = questionObj?.options.find(
          (opt) => opt.value === ans
        );

        return {
          question_id: qId,
          answer: ans,
          point: selectedOption?.point || 0,
        };
      });

      const payload = {
        lead_id: lead?._id,
        questions: formattedQuestions,
        message: note,
        rating,
        next_follow_up_date: nextFollowUpDate,
        next_follow_up_time: nextFollowUpTime,

        // 🔥 NEW QUALITATIVE DATA
        pitchSummary,
        courseSuggested,
        collegesSuggested,
        studentObjections,
        nextAction,

        submitQuestion: {
          submitted: submittedCount,
          total: totalQuestions,
        },
      };

      const response = await API.post(`/lead/conversation`, payload);
      toast.success(response?.data?.message);
      navigate(`/dashboard/leads/view/${lead?._id}`);
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";

      console.error(message)
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }, [
    lead?._id,
    answers,
    note,
    rating,
    nextFollowUpDate,
    nextFollowUpTime,
    navigate,
    setIsSaving,
    submittedCount,
    totalQuestions,
    questions,
    overallAnswerScore,
    overallLeadScore,
  ]);

  const FinalRating = FeedbackData?.find((item) => item?.value === rating);
  const FinalRatingIcon = FinalRating?.icon;

  // --- Table Columns ---
  const columns = [
    {
      label: "Question",
      value: (row) => (
        <span className="font-medium text-[var(--yp-text-secondary)]">
          {row.title}
        </span>
      ),
    },
    {
      label: "Selected Answer",
      value: (row) => {
        const answerValue = answers[row.id];
        return answerValue ? (
          <span className="font-medium text-[var(--yp-main)]">
            {getAnswerLabel(row.id, answerValue)}
          </span>
        ) : (
          <span className="text-[var(--yp-muted)] italic">Skipped</span>
        );
      },
    },
  ];

  if (isAdmin) {
    columns.push({
      label: "Sentiment",
      value: (row) => {
        const answerValue = answers[String(row.id)];
        if (!answerValue) {
          return <span className="text-[var(--yp-muted)]">-</span>;
        }

        const point = Number(getAnswerPoint(row.id, answerValue) || 0);

        let val;
        if (point > 0) {
          val = { value: "Positive", color: "success" };
        } else if (point < 0) {
          val = { value: "Negative", color: "danger" };
        } else {
          val = { value: "Neutral", color: "warning" };
        }

        return <Badge label={val.value} color={val.color} />;
      },
    });
  }

  const previewScore = overallLeadScore;
  const score = Number(previewScore || 0);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-2 text-[var(--yp-main)] font-semibold tracking-wide text-sm uppercase">
        Review & Submit
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-[var(--yp-text-secondary)] mb-8 leading-tight">
        Final Summary
      </h1>

      {/* Table Section */}
      <div className="bg-[var(--yp-primary)] border border-[var(--yp-border-primary)] rounded-xl overflow-hidden shadow-sm mb-8">
        <SimpleTable data={questions} columns={columns} />

        {/* Footer Stats */}
        <div className="flex border-t border-[var(--yp-border-primary)] bg-[var(--yp-tertiary)]/30">
          <div className="p-4 w-1/3 min-w-[200px] text-[var(--yp-text-secondary)] font-bold border-r border-[var(--yp-border-primary)] md:border-r-0 flex flex-col justify-center">
            Final Details
          </div>

          <div className="p-4 flex-1 text-[var(--yp-text-secondary)] space-y-3">
            <div className="flex flex-wrap gap-6">
              {/* Completion */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase text-[var(--yp-muted)]">
                  Completion:
                </span>
                <div className="flex items-center gap-2 font-bold">
                  <LuListChecks className="text-[var(--yp-main)]" />
                  {submittedCount} / {totalQuestions}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase text-[var(--yp-muted)]">
                  Rating:
                </span>
                <div
                  className={`flex items-center gap-2 font-bold rounded-xl px-2 py-0.5 text-sm
                  ${FinalRating?.bg}
                  ${FinalRating?.color}
                `}
                >
                  {FinalRatingIcon && <FinalRatingIcon />}
                  {FinalRating?.label || "Not Rated"}
                </div>
              </div>

              {/* Next Call */}
              {nextFollowUpDate && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase text-[var(--yp-muted)]">
                    Next Call:
                  </span>
                  <div className="flex items-center gap-2 font-bold text-[var(--yp-main)]">
                    <LuCalendarClock />
                    {new Date(nextFollowUpDate).toLocaleDateString()}
                    {nextFollowUpTime ? ` at ${nextFollowUpTime}` : ""}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 pt-2 border-t border-[var(--yp-border-primary)]">
              <span className="text-xs font-semibold uppercase text-[var(--yp-muted)] w-24 mt-1">
                Note:
              </span>
              <p className="text-sm">
                {note || (
                  <span className="text-[var(--yp-muted)] italic">
                    No notes added.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="p-2">
          {pitchSummary && (
            <div className="flex items-start gap-2 pt-2 border-t">
              <span className="text-xs font-semibold uppercase w-24 mt-1">
                Pitch:
              </span>
              <p className="text-sm">{pitchSummary}</p>
            </div>
          )}

          {Array.isArray(collegesSuggested) && collegesSuggested.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase w-24">
                Colleges Suggested:
              </span>
              <p className="font-medium">{collegesSuggested.join(", ")}</p>
            </div>
          )}

          {normalizedCourses.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase w-24">
                Courses Suggested:
              </span>
              <p className="font-medium">{normalizedCourses.join(", ")}</p>
            </div>
          )}

          {Array.isArray(studentObjections) && studentObjections.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase w-24">
                Objections:
              </span>
              <p className="font-medium text-[var(--yp-warning)]">
                {studentObjections.join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase w-24">
          Next Action:
        </span>
        <p className="font-medium">{nextAction === "call_again" ? "Call Again" : null}</p>
        <p className="font-medium">{nextAction === "send_whatsapp" ? "Send Whatsapp" : null}</p>
        <p className="font-medium">{nextAction === "schedule_visit" ? "Schedule Visit" : null}</p>
        <p className="font-medium">{nextAction === "closed" ? "Closed" : null}</p>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t border-[var(--yp-border-primary)]">
        <button
          onClick={handlePrevious}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-[var(--yp-text-primary)] hover:bg-[var(--yp-tertiary)] transition-colors"
        >
          <FaChevronLeft className="w-4 h-4" /> Edit Details
        </button>

        <button
          onClick={submitConversation}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-2.5 rounded-lg font-medium transition-all shadow-sm bg-[var(--yp-success)] text-white hover:opacity-90"
        >
          {isSaving ? (
            <>
              Saving <LuLoader className="w-4 h-4 animate-spin" />
            </>
          ) : (
            <>
              Confirm & Submit <LuCircleCheck className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}