import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FeedbackData } from "../../../common/FeedbackData/FeedbackData";
import { CollegeList } from "../../../common/CollegeList/CollegeList";
import Select from "react-select";

const TIME_SLOTS = [
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
  "17:00-18:00",
];

export const NEXT_ACTIONS = [
  { label: "Call Again", value: "call_again" },
  { label: "Send WhatsApp", value: "send_whatsapp" },
  { label: "Schedule Visit", value: "schedule_visit" },
  { label: "Closed", value: "closed" },
];

export default function NoteStep({
  note,
  setNote,
  rating,
  setRating,
  nextFollowUpDate,
  setNextFollowUpDate,
  nextFollowUpTime,
  setNextFollowUpTime,

  pitchSummary,
  setPitchSummary,
  courseSuggested,
  setCourseSuggested,
  collegesSuggested,
  setCollegesSuggested,
  studentObjections,
  setStudentObjections,
  nextAction,
  setNextAction,

  isConversationStopped,
  handlePrevious,
  handleNext,
}) {

  const [selectedColleges, setSelectedColleges] = useState(
    (collegesSuggested || []).map(name => ({
      label: name,
      value: name
    }))
  );

  const [courseOptions, setCourseOptions] = useState(
    Array.isArray(courseSuggested)
      ? courseSuggested.map(c => ({ label: c, value: c }))
      : []
  );

  const [objectionsInput, setObjectionsInput] = useState(() =>
    studentObjections.join(", ")
  );

  useEffect(() => {

    if (!collegesSuggested?.length) return;

    const matchedColleges = CollegeList.filter(college =>
      collegesSuggested.includes(college.name)
    );

    const courses = matchedColleges.flatMap(college => {
      const { UG = [], PG = [], Diploma = [] } = college.courses || {};
      return [...UG, ...PG, ...Diploma];
    });

    const uniqueCourses = [...new Set(courses)];

    setCourseOptions(uniqueCourses.map(c => ({
      label: c,
      value: c
    })));

  }, [collegesSuggested]);

  /* ---------------- College Select Options ---------------- */

  const collegeOptions = CollegeList.map((college) => ({
    label: college.name,
    value: college._id,
  }));

  /* ---------------- Handle College Change ---------------- */

  const handleCollegeChange = (selected) => {
    const safeSelected = selected || [];

    setSelectedColleges(safeSelected);
    setCourseSuggested([]); // reset courses

    const courses = safeSelected.flatMap((col) => {
      const college = CollegeList.find((c) => c._id === col.value);

      if (!college) return [];

      const { UG = [], PG = [], Diploma = [] } = college.courses || {};

      return [...UG, ...PG, ...Diploma];
    });

    const uniqueCourses = [...new Set(courses)];

    const formattedCourses = uniqueCourses.map((course) => ({
      label: course,
      value: course,
    }));

    setCourseOptions(formattedCourses);

    setCollegesSuggested(safeSelected.map((c) => c.label));
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="mb-2 text-[var(--yp-main)] font-semibold tracking-wide text-sm uppercase">
        Almost Done
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-[var(--yp-text-secondary)] mb-8">
        Rate & Schedule
      </h1>

      {/* Rating */}

      <div className="mb-8">
        <label className="block text-sm font-medium mb-4">
          How would you rate the lead potential?
        </label>

        <div className="flex flex-wrap gap-4 md:gap-8">
          {FeedbackData.map((opt) => {
            const Icon = opt.icon;
            const isSelected = rating === opt.value;

            return (
              <button
                key={opt.value}
                onClick={() => setRating(opt.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition
                ${isSelected
                    ? `${opt.bg} ${opt.color} border-current scale-110 shadow-md`
                    : "border-transparent hover:bg-[var(--yp-tertiary)]"
                  }`}
              >
                <Icon className="w-10 h-10" />
                <span className="text-xs font-semibold">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Grid */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

        {/* Follow-up Date */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Next Follow-up Date
          </label>

          <input
            type="date"
            className="w-full p-4 rounded-xl border"
            value={nextFollowUpDate}
            onChange={(e) => setNextFollowUpDate(e.target.value)}
          />
        </div>

        {/* Follow-up Time */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Next Follow-up Time
          </label>

          <select
            className="w-full p-4 rounded-xl border"
            value={nextFollowUpTime}
            onChange={(e) => setNextFollowUpTime(e.target.value)}
            disabled={!nextFollowUpDate}
          >
            <option value="">Select time slot</option>

            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot.replace("-", " - ")}
              </option>
            ))}
          </select>
        </div>

        {/* Note */}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Add a note
          </label>

          <textarea
            className="w-full p-4 rounded-xl border h-32 resize-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Pitch Summary */}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            What did you pitch?
          </label>

          <textarea
            className="w-full p-4 rounded-xl border h-28"
            value={pitchSummary}
            onChange={(e) => setPitchSummary(e.target.value)}
          />
        </div>

        {/* Colleges Suggested */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Colleges Suggested
          </label>

          <Select
            options={collegeOptions}
            isMulti
            placeholder="Select colleges..."
            value={selectedColleges}
            onChange={handleCollegeChange}
          />
        </div>

        {/* Courses Suggested */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Courses Suggested
          </label>

          <Select
            options={courseOptions}
            isMulti
            value={(courseSuggested || [])
              .flatMap(c => c.split(","))
              .map(c => ({ label: c.trim(), value: c.trim() }))}
            placeholder="Select courses..."
            onChange={(selected) => {
              setCourseSuggested((selected || []).map(c => c.value))
            }}
          />
        </div>

        {/* Student Objections */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Student Objections
          </label>

          <input
            type="text"
            className="w-full p-4 rounded-xl border"
            value={objectionsInput}
            onChange={(e) => {
              const val = e.target.value;
              setObjectionsInput(val);

              setStudentObjections(
                val.split(",").map((o) => o.trim()).filter(Boolean)
              );
            }}
          />
        </div>

        {/* Next Action */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Next Action
          </label>

          <select
            className="w-full p-4 rounded-xl border"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
          >
            <option value="">Select Action</option>
            {NEXT_ACTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={handlePrevious}
          disabled={isConversationStopped}   // ✅ add this
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors
        ${isConversationStopped
              ? "opacity-40 cursor-not-allowed text-gray-400"
              : "hover:bg-gray-100 text-gray-700"
            }`}
        >
          <FaChevronLeft className="w-4 h-4" /> Previous
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-8 py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:opacity-90"
        >
          Review Summary <FaChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}