import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import { API } from "../../services/API";
import { useAuth } from "../../context/AuthContext";

import ConversationSidebar from "./LeadConversation/ConversationSidebar";
import ConversationHeader from "./LeadConversation/ConversationHeader";
import FinalSummaryStep from "./LeadConversation/FinalSummaryStep";
import NoteStep from "./LeadConversation/NoteStep";
import QuestionSteps from "./LeadConversation/QuestionSteps";
import StartConversation from "./LeadConversation/StartConversation";
import LeadConversationSkeleton from "./Skeleton/LeadConversationSkeleton";
import toast from "react-hot-toast";

export default function LeadConversation() {
    const { id } = useParams();
    const { authUser } = useAuth();

    const [lead, setLead] = useState(null);
    const [isStarted, setIsStarted] = useState(false);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [note, setNote] = useState("");
    const [sessions, setSessions] = useState([]);

    const [nextFollowUpDate, setNextFollowUpDate] = useState("");
    const [nextFollowUpTime, setNextFollowUpTime] = useState("");

    const [rating, setRating] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    const [questionsQueue, setQuestionsQueue] = useState([]);

    const [isLoadingLead, setIsLoadingLead] = useState(true);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
    const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);

    const [pitchSummary, setPitchSummary] = useState("");
    const [courseSuggested, setCourseSuggested] = useState("");
    const [collegesSuggested, setCollegesSuggested] = useState([]);
    const [studentObjections, setStudentObjections] = useState([]);
    const [nextAction, setNextAction] = useState("call_again");

    const [isConversationStopped, setIsConversationStopped] = useState(false);

    const nicheId = authUser?.nicheId;

    const [searchParams] = useSearchParams();
    // const isNewSession = searchParams.get("newSession") === "true";
    const mode = searchParams.get("mode"); // "continue" | "new"
    const isNewSession = mode === "new";
    const isContinue = mode === "continue";

    /* -------------------------------------------------- */
    /* Fetch Questions (API ONLY)                          */
    /* -------------------------------------------------- */
    const fetchQuestions = useCallback(async () => {
        if (!nicheId) return;

        try {
            setIsLoadingQuestions(true);

            const res = await API.get(`/questions/niche/${nicheId}`);
            const questions = (res?.data?.data || [])
                .filter(q => q.status === "active")
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map(q => ({
                    ...q,
                    id: String(q._id), // ✅ normalize stable id
                }));

            setQuestionsQueue(questions);
        } catch (error) {
            console.error(
                error?.response?.data?.message ||
                error?.message ||
                "Error fetching questions"
            );
            setQuestionsQueue([]);
        } finally {
            setIsLoadingQuestions(false);
        }
    }, [nicheId]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    /* -------------------------------------------------- */
    /* Step Indices                                        */
    /* -------------------------------------------------- */
    const NOTE_STEP_INDEX = questionsQueue.length;
    const SUMMARY_STEP_INDEX = questionsQueue.length + 1;

    /* -------------------------------------------------- */
    /* Fetch Lead                                          */
    /* -------------------------------------------------- */
    const getLead = useCallback(async () => {
        try {
            setIsLoadingLead(true);
            const res = await API.get(`/leads/${id}`);
            setLead(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingLead(false);
        }
    }, [id]);

    useEffect(() => {
        getLead();
    }, [getLead]);

    /* -------------------------------------------------- */
    /* Fetch Saved Answers with Ownership Check           */
    /* -------------------------------------------------- */
    const getAnswers = useCallback(async () => {
        if (!lead?._id || !authUser?._id) return;

        try {
            setIsLoadingAnswers(true);

            const res = await API.get(`/lead/conversation/${lead._id}`);
            const sessionsData = res.data?.sessions || [];
            setSessions(sessionsData);

            // ❌ No history → reset
            if (!sessionsData.length) {
                resetConversationState();
                return;
            }

            const latestSession = sessionsData.at(-1);

            // 🔥 Restart → ignore everything
            if (isNewSession) {
                resetConversationState();
                setIsStarted(true);
                setCurrentQIndex(0);
                return;
            }

            // ✅ Build answer map FIRST
            const answerMap = (latestSession?.questions || []).reduce((acc, q) => {
                acc[String(q.question_id)] = q.answer ?? "";
                return acc;
            }, {});

            /* ---------------- PREFILL DATA ---------------- */

            setAnswers(answerMap);
            setNote(latestSession?.message || "");
            setRating(latestSession?.rating || 0);
            setPitchSummary(latestSession?.pitchSummary || "");

            setCourseSuggested(
                Array.isArray(latestSession?.courseSuggested)
                    ? latestSession.courseSuggested.flatMap(c =>
                        String(c).split(",").map(v => v.trim())
                    )
                    : []
            );

            setCollegesSuggested(latestSession?.collegesSuggested || []);
            setStudentObjections(latestSession?.studentObjections || []);
            setNextAction(latestSession?.nextAction || "call_again");

            // ✅ Safe follow-up (no accidental overwrite)
            if (latestSession?.next_follow_up_date) {
                setNextFollowUpDate(
                    new Date(latestSession.next_follow_up_date)
                        .toISOString()
                        .slice(0, 10)
                );
            }

            if (latestSession?.next_follow_up_time) {
                setNextFollowUpTime(latestSession.next_follow_up_time);
            }

            /* ---------------- RESUME / CONTINUE LOGIC ---------------- */

            const answeredIds = Object.keys(answerMap).map(String);

            let lastAnsweredIndex = -1;

            questionsQueue.forEach((q, idx) => {
                if (answeredIds.includes(String(q.id))) {
                    lastAnsweredIndex = Math.max(lastAnsweredIndex, idx);
                }
            });

            const firstQuestion = questionsQueue[0];
            const firstAnswer = answerMap[firstQuestion?.id];

            const stopOption = firstQuestion?.options?.find(
                o => o.value === firstAnswer
            );

            // 🔥 FLOW CONTROL
            if (isContinue) {
                // ✅ Always start fresh (but with prefilled data)
                setCurrentQIndex(0);
                setIsConversationStopped(false);
            } else {
                // ✅ Resume previous progress

                if (stopOption?.action === "STOP_CONVERSATION") {
                    setCurrentQIndex(0);
                    setIsConversationStopped(true);
                } else if (lastAnsweredIndex === questionsQueue.length - 1) {
                    setCurrentQIndex(NOTE_STEP_INDEX);
                } else {
                    setCurrentQIndex(lastAnsweredIndex + 1);
                }
            }

            setIsStarted(true);

        } catch (err) {
            if (err?.response?.status === 404) {
                resetConversationState();
            } else {
                console.error("getAnswers:", err);
            }
        } finally {
            setIsLoadingAnswers(false);
        }
    }, [lead?._id, authUser?._id, questionsQueue, isNewSession, isContinue]);

    // Helper to clear state
    const resetConversationState = () => {
        setAnswers({});
        setNote("");
        setRating(0);
        setIsStarted(false);
        setPitchSummary("");
        setCourseSuggested([]);
        setCollegesSuggested([]);
        setStudentObjections([]);
        setNextAction("call_again");
        setNextFollowUpDate("");
        setNextFollowUpTime("");
        setIsConversationStopped(false);
    };

    useEffect(() => {
        getAnswers();
    }, [getAnswers]);

    /* -------------------------------------------------- */
    /* Sidebar Helpers                                     */
    /* -------------------------------------------------- */
    const maxAnsweredIndex = useMemo(() => {
        const answeredIds = Object.keys(answers).map(String);
        if (!answeredIds.length) return -1;

        let maxIdx = -1;
        questionsQueue.forEach((q, idx) => {
            if (answeredIds.includes(String(q.id))) {
                maxIdx = Math.max(maxIdx, idx);
            }
        });
        return maxIdx;
    }, [answers, questionsQueue]);

    const answeredCount = Object.keys(answers).length;
    const progressPercentage =
        questionsQueue.length > 0
            ? (answeredCount / questionsQueue.length) * 100
            : 0;

    const hasHistory = sessions.length > 0;

    /* -------------------------------------------------- */
    /* Flow Controls                                       */
    /* -------------------------------------------------- */
    const handleStart = () => setIsStarted(true);

    const handleOptionSelect = (questionId, value) => {
        const question = questionsQueue.find(q => q.id === questionId);
        const selectedOption = question?.options.find(o => o.value === value);

        setAnswers(prev => ({
            ...prev,
            [questionId]: value,
        }));

        // 🔴 STOP CONVERSATION
        if (selectedOption?.action === "STOP_CONVERSATION") {
            setRating(0);
            setIsConversationStopped(true);
            setCurrentQIndex(NOTE_STEP_INDEX);
            setIsStarted(true);
            return;
        }

        // ✅ ADD THIS — unlock sidebar if user switches away from a stop option
        if (isConversationStopped) {
            setIsConversationStopped(false);
        }
    };

    const handleNext = (isSkip = false) => {
        if (isSkip && currentQIndex === 0) {
            toast.error("First question cannot be skipped");
            return;
        }

        if (currentQIndex === NOTE_STEP_INDEX) {
            setCurrentQIndex(SUMMARY_STEP_INDEX);
            return;
        }

        const currentQuestion = questionsQueue[currentQIndex];
        if (!currentQuestion) return;

        const selectedAnswer = answers[currentQuestion.id];

        if (!isSkip && !selectedAnswer) {
            toast.error("no answer selected");
            return;
        }

        const selectedOption = currentQuestion.options?.find(o => o.value === selectedAnswer);

        if (selectedOption?.action === "STOP_CONVERSATION") {
            setCurrentQIndex(NOTE_STEP_INDEX);
            return;
        }

        if (currentQIndex < NOTE_STEP_INDEX) {
            setCurrentQIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQIndex > 0) {
            setCurrentQIndex(prev => prev - 1);
        }
    };

    /* -------------------------------------------------- */
    /* Step Flags                                          */
    /* -------------------------------------------------- */
    const currentQuestion = questionsQueue[currentQIndex];
    const isNoteStep = currentQIndex === NOTE_STEP_INDEX;
    const isSummaryStep = currentQIndex === SUMMARY_STEP_INDEX;

    /* -------------------------------------------------- */
    /* Guards                                              */
    /* -------------------------------------------------- */
    if (isLoadingLead || isLoadingQuestions || isLoadingAnswers) {
        return <LeadConversationSkeleton />;
    }

    if (!questionsQueue.length) {
        return (
            <div className="p-10 text-center text-[var(--yp-muted)]">
                No questions configured for this niche. {" "}
                <Link to="/dashboard/questions/add" className="text-blue-500">
                    First Add questions.
                </Link>
            </div>
        );
    }

    /* -------------------------------------------------- */
    /* Render                                              */
    /* -------------------------------------------------- */
    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Lead", to: "/dashboard/leads/all" },
                    {
                        label: lead?.name || "Lead",
                        to: `/dashboard/leads/view/${lead?._id}`,
                    },
                    { label: "Conversation" },
                ]}
            />

            <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                <ConversationSidebar
                    isConversationStopped={isConversationStopped}
                    answeredCount={answeredCount}
                    progressPercentage={progressPercentage}
                    ADMISSION_QUESTIONS={questionsQueue}
                    maxAnsweredIndex={maxAnsweredIndex}
                    answers={answers}
                    isStarted={isStarted}
                    hasHistory={hasHistory}
                    currentQIndex={currentQIndex}
                    isNoteStep={isNoteStep}
                    isSummaryStep={isSummaryStep}
                    note={note}
                    setCurrentQIndex={setCurrentQIndex}
                    setIsStarted={setIsStarted}
                    NOTE_STEP_INDEX={NOTE_STEP_INDEX}
                    SUMMARY_STEP_INDEX={SUMMARY_STEP_INDEX}
                />

                <div className="flex-1 flex flex-col relative">
                    <ConversationHeader
                        lead={lead}
                        isStarted={isStarted}
                        hasHistory={hasHistory}
                    />

                    <div className="flex-1 p-8 flex flex-col items-center text-[var(--yp-text-secondary)]">
                        {!isStarted ? (
                            <StartConversation
                                handleStart={handleStart}
                                hasHistory={hasHistory}
                            />
                        ) : isSummaryStep ? (
                            <FinalSummaryStep
                                answers={answers}
                                questions={questionsQueue}
                                note={note}
                                rating={rating}
                                nextFollowUpDate={nextFollowUpDate}
                                nextFollowUpTime={nextFollowUpTime}

                                pitchSummary={pitchSummary}
                                courseSuggested={courseSuggested}
                                collegesSuggested={collegesSuggested}
                                studentObjections={studentObjections}
                                nextAction={nextAction}

                                handlePrevious={handlePrevious}
                                isSaving={isSaving}
                                setIsSaving={setIsSaving}
                                lead={lead}
                            />
                        ) : isNoteStep ? (
                            <NoteStep
                                note={note}
                                setNote={setNote}
                                rating={rating}
                                setRating={setRating}
                                nextFollowUpDate={nextFollowUpDate}
                                setNextFollowUpDate={setNextFollowUpDate}
                                nextFollowUpTime={nextFollowUpTime}
                                setNextFollowUpTime={setNextFollowUpTime}

                                /* 🔥 NEW PROPS */
                                pitchSummary={pitchSummary}
                                setPitchSummary={setPitchSummary}
                                courseSuggested={courseSuggested}
                                setCourseSuggested={setCourseSuggested}
                                collegesSuggested={collegesSuggested}
                                setCollegesSuggested={setCollegesSuggested}
                                studentObjections={studentObjections}
                                setStudentObjections={setStudentObjections}
                                nextAction={nextAction}
                                setNextAction={setNextAction}

                                isConversationStopped={isConversationStopped}
                                handleNext={handleNext}
                                handlePrevious={handlePrevious}
                            />
                        ) : (
                            <QuestionSteps
                                currentQIndex={currentQIndex}
                                isSaving={isSaving}
                                answers={answers}
                                ADMISSION_QUESTIONS={questionsQueue}
                                currentQuestion={currentQuestion}
                                handleOptionSelect={handleOptionSelect}
                                handleNext={handleNext}
                                handlePrevious={handlePrevious}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}