import { useState, useEffect, useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FeedbackData } from "../../../common/FeedbackData/FeedbackData";
import Select from "react-select";
import { CampusaimAPI } from "../../../services/API";
import toast from "react-hot-toast";

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

const classesOptions = [
  { label: "Play Group", value: "Play Group" },
  { label: "Nursery", value: "Nursery" },
  { label: "KG", value: "KG" },
  { label: "LKG", value: "LKG" },
  { label: "UKG", value: "UKG" },
  { label: "1st", value: "1st" },
  { label: "2nd", value: "2nd" },
  { label: "3rd", value: "3rd" },
  { label: "4th", value: "4th" },
  { label: "5th", value: "5th" },
  { label: "6th", value: "6th" },
  { label: "7th", value: "7th" },
  { label: "8th", value: "8th" },
  { label: "9th", value: "9th" },
  { label: "10th", value: "10th" },
  { label: "11th", value: "11th" },
  { label: "12th", value: "12th" },
];

export const examsOptions = [
  // Defence
  { label: "NDA", value: "NDA" },
  { label: "CDS", value: "CDS" },
  { label: "AFCAT", value: "AFCAT" },
  { label: "INET", value: "INET" },
  { label: "CAPF", value: "CAPF" },
  { label: "Territorial Army", value: "Territorial Army" },
  { label: "SSB Interview", value: "SSB Interview" },
  { label: "Military School", value: "Military School" },
  { label: "Sainik School", value: "Sainik School" },
  { label: "RMS", value: "RMS" },
  { label: "RIMC", value: "RIMC" },
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

  lead,
  property,
  course,
  propertyCourse,
  category,
}) {
  const leadCategory = lead?.category;

  const categoryId = leadCategory;
  const myCategory = category.filter((a) => a?._id === categoryId);

  const categoryKeyMap = {
    School: "school",
    College: "college_university",
    University: "college_university",
    Coaching: "coaching"
  };

  const categoryName = myCategory?.[0]?.category_name;
  const categoryKey = categoryKeyMap[categoryName];



  const [selectedColleges, setSelectedColleges] = useState([]);

  const [objectionsInput, setObjectionsInput] = useState(() =>
    studentObjections.join(", ")
  );

  /* ---------------- Handle College Change ---------------- */
  const handleCollegeChange = (selected) => {
    const safeSelected = selected || [];

    setSelectedColleges(safeSelected);

    // Reset selected courses
    setCourseSuggested([]);

    // Save selected property names
    setCollegesSuggested(
      safeSelected.map((item) => item.label)
    );
  };

  const isCollegeUniversity = categoryKey === "college_university";
  const isCoaching = categoryKey === "coaching";
  const isSchool = categoryKey === "school";

  const propertyOptions = useMemo(() => {
    return property
      .filter(
        (item) =>
          String(item?.academic_type) === String(leadCategory)
      )
      .map((item) => ({
        label: item.property_name,
        value: item._id,
      }));
  }, [property, leadCategory]);

  useEffect(() => {
    if (!propertyOptions?.length) return;

    const selected = propertyOptions.filter((item) =>
      (collegesSuggested || []).includes(item.label)
    );

    setSelectedColleges((prev) => {
      const prevString = JSON.stringify(prev);
      const nextString = JSON.stringify(selected);

      return prevString === nextString ? prev : selected;
    });
  }, [propertyOptions, collegesSuggested]);

  const courseOptions = useMemo(() => {
    if (!selectedColleges?.length) return [];

    // Selected property IDs
    const selectedPropertyIds = selectedColleges.map(
      (item) => String(item.value)
    );

    // Matched mappings
    const matchedPropertyCourses = propertyCourse.filter((pc) =>
      selectedPropertyIds.includes(String(pc.property_id))
    );

    // Extract course IDs
    const courseIds = matchedPropertyCourses.map((pc) =>
      String(pc.course_id)
    );

    // Actual courses
    const filteredCourses = course.filter((item) =>
      courseIds.includes(String(item._id))
    );

    return filteredCourses.map((item) => ({
      label: item.course_name,
      value: item._id,
    }));
  }, [selectedColleges, propertyCourse, course]);

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

        {isCollegeUniversity ? (
          <>
            {/* Colleges & Universities Suggested */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Colleges & Universities Suggested
              </label>

              <Select
                options={propertyOptions}
                isMulti
                placeholder="Select colleges & universities..."
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
                value={courseOptions.filter((option) =>
                  courseSuggested.some((id) => String(id) === String(option.value))
                )}
                placeholder="Select courses..."
                onChange={(selected) => {
                  setCourseSuggested((selected || []).map(c => c.value))
                }}
              />
            </div>
          </>
        ) : null}

        {isCoaching ? (
          <>
            {/* Coachings Suggested */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Coachings Suggested
              </label>

              <Select
                options={propertyOptions}
                isMulti
                placeholder="Select coachings..."
                value={selectedColleges}
                onChange={handleCollegeChange}
              />
            </div>

            {/* Coaching Suggested */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Coaching Suggested
              </label>

              <Select
                options={examsOptions}
                isMulti
                value={examsOptions.filter((option) =>
                  courseSuggested.some((id) => String(id) === String(option.value))
                )}
                placeholder="Select coaching..."
                onChange={(selected) => {
                  setCourseSuggested((selected || []).map(c => c.value))
                }}
              />
            </div>
          </>
        ) : null}

        {isSchool ? (
          <>
            {/* Schools Suggested */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Schools Suggested
              </label>

              <Select
                options={propertyOptions}
                isMulti
                placeholder="Select schools..."
                value={selectedColleges}
                onChange={handleCollegeChange}
              />
            </div>

            {/* Classes Suggested */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Classes Suggested
              </label>

              <Select
                options={classesOptions}
                isMulti
                value={classesOptions.filter((option) =>
                  courseSuggested.some((id) => String(id) === String(option.value))
                )}
                placeholder="Select classes..."
                onChange={(selected) => {
                  setCourseSuggested((selected || []).map(c => c.value))
                }}
              />
            </div>
          </>
        ) : null}

        {/* Next Action */}
        {/* <div>
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
        </div> */}
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