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

  allCourses = [],
}) {
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const normalizedCourses = useMemo(() => {
    if (!Array.isArray(courseSuggested)) return [];

    return courseSuggested.map((id) => {
      const matchedCourse = allCourses.find(
        (course) => String(course?._id) === String(id)
      );

      return matchedCourse?.course_name || id;
    });
  }, [courseSuggested, allCourses]);

  const totalQuestions = questions.length;
  const submittedCount = Object.keys(answers).length;

  const isAdmin = authUser?.appRole === "admin" || authUser?.appRole === "superadmin";

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

        <div className="border-t border-[var(--yp-border-primary)] bg-[var(--yp-primary)] p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Pitch Summary */}
            {pitchSummary && (
              <div className="bg-[var(--yp-tertiary)]/40 rounded-xl p-4 border border-[var(--yp-border-primary)]">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--yp-muted)] mb-2">
                  Pitch Summary
                </p>

                <p className="text-sm leading-6 text-[var(--yp-text-secondary)]">
                  {pitchSummary}
                </p>
              </div>
            )}

            {/* Next Action */}
            {/* {nextAction && (
              <div className="bg-[var(--yp-tertiary)]/40 rounded-xl p-4 border border-[var(--yp-border-primary)]">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--yp-muted)] mb-2">
                  Next Action
                </p>

                <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-[var(--yp-main)]/10 text-[var(--yp-main)]">
                  {nextAction === "call_again" && "Call Again"}
                  {nextAction === "send_whatsapp" && "Send WhatsApp"}
                  {nextAction === "schedule_visit" && "Schedule Visit"}
                  {nextAction === "closed" && "Closed"}
                </div>
              </div>
            )} */}

            {/* Colleges */}
            {Array.isArray(collegesSuggested) &&
              collegesSuggested.length > 0 && (
                <div className="md:col-span-2 bg-[var(--yp-tertiary)]/40 rounded-xl p-4 border border-[var(--yp-border-primary)]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--yp-muted)] mb-3">
                    Colleges & Universities Suggested
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {collegesSuggested.map((college, index) => (
                      <span
                        key={`${college}-${index}`}
                        className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        {college}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Courses */}
            {normalizedCourses.length > 0 && (
              <div className="md:col-span-2 bg-[var(--yp-tertiary)]/40 rounded-xl p-4 border border-[var(--yp-border-primary)]">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--yp-muted)] mb-3">
                  Courses Suggested
                </p>

                <div className="flex flex-wrap gap-2">
                  {normalizedCourses.map((course, index) => (
                    <span
                      key={`${course}-${index}`}
                      className="px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Objections */}
            {Array.isArray(studentObjections) &&
              studentObjections.length > 0 && (
                <div className="md:col-span-2 bg-orange-50/60 rounded-xl p-4 border border-orange-200">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 mb-3">
                    Student Objections
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {studentObjections.map((item, index) => (
                      <span
                        key={`${item}-${index}`}
                        className="px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-700 border border-orange-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
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