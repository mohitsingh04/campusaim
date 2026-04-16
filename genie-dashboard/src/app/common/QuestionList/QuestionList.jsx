export const QuestionList = [
  /* ---------------- CALL VALIDATION ---------------- */
  {
    id: 1,
    order: 1,
    title: "Call Status",
    questionText: "What was the status of the call?",
    isActive: true,
    options: [
      { value: "call_continued", label: "Call continued", point: 1, action: "CONTINUE" },
      { value: "busy", label: "Busy", point: 0, action: "STOP_CONVERSATION" },
      { value: "cut", label: "Call Cut / Disconnected", point: -1, action: "STOP_CONVERSATION" },
      { value: "call_later", label: "Asked to Call Later", point: 0, action: "STOP_CONVERSATION" },
    ],
  },
  {
    id: 2,
    order: 2,
    title: "Lead Confirmation",
    questionText: "The inquiry is for whom?",
    isActive: true,
    options: [
      { value: "self_confirmed", label: "Student (Self)", point: 1, action: "CONTINUE" },
      { value: "guardian", label: "Parent / Guardian", point: 1, action: "CONTINUE" },
      { value: "different_person", label: "Different Person", point: -1, action: "CONTINUE" },
      { value: "not_sure", label: "Not Sure", point: -1, action: "CONTINUE" },
    ],
  },

  /* ---------------- ELIGIBILITY ---------------- */
  {
    id: 3,
    order: 3,
    title: "Academic Qualification",
    questionText: "What is the student's current qualification?",
    isActive: true,
    options: [
      { value: "12th_pass", label: "12th Passed", point: 1, action: "CONTINUE" },
      { value: "12th_appearing", label: "12th Appearing", point: 1, action: "CONTINUE" },
      { value: "graduate", label: "Graduate", point: 1, action: "CONTINUE" },
      { value: "diploma", label: "Diploma Holder", point: 1, action: "CONTINUE" },
      { value: "postgraduate", label: "Postgraduate", point: 1, action: "CONTINUE" },
      { value: "working", label: "Working Professional", point: 1, action: "CONTINUE" },
    ],
  },
  {
    id: 4,
    order: 4,
    title: "Stream Background",
    questionText: "What was the student's stream in 12th?",
    isActive: true,
    options: [
      { value: "pcm", label: "Science - PCM (Physics, Chemistry, Maths)", point: 1, action: "CONTINUE" },
      { value: "pcb", label: "Science - PCB (Physics, Chemistry, Biology)", point: 1, action: "CONTINUE" },
      { value: "commerce", label: "Commerce", point: 1, action: "CONTINUE" },
      { value: "arts", label: "Arts / Humanities", point: 1, action: "CONTINUE" },
      { value: "other_stream", label: "Other / Not Applicable", point: 0, action: "CONTINUE" },
    ],
  },

  /* ---------------- INTENT DISCOVERY ---------------- */
  {
    id: 5,
    order: 5,
    title: "Stream Interest",
    questionText: "Which stream/course domain is the student interested in?",
    isActive: true,
    options: [
      { value: "engineering", label: "Engineering / Technology", point: 1, action: "CONTINUE" },
      { value: "management", label: "Management / Commerce", point: 1, action: "CONTINUE" },
      { value: "medical", label: "Medical / Paramedical", point: 1, action: "CONTINUE" },
      { value: "arts_humanities", label: "Arts / Humanities", point: 1, action: "CONTINUE" },
      { value: "science", label: "Pure Science", point: 1, action: "CONTINUE" },
      { value: "law", label: "Law / Legal Studies", point: 1, action: "CONTINUE" },
      { value: "design_media", label: "Design / Media / Animation", point: 1, action: "CONTINUE" },
      { value: "not_decided", label: "Not Decided Yet", point: 0, action: "CONTINUE" },
      { value: "other", label: "Other (Specify)", point: 0, action: "CAPTURE_TEXT" },
    ],
  },
  {
    id: 6,
    order: 6,
    title: "Career Goal",
    questionText: "What is the primary career goal of the student?",
    isActive: true,
    options: [
      { value: "job", label: "Get a Job Quickly", point: 1, action: "CONTINUE" },
      { value: "higher_study", label: "Higher Studies", point: 1, action: "CONTINUE" },
      { value: "govt_exam", label: "Government Exams Preparation", point: 0, action: "CONTINUE" },
      { value: "not_sure", label: "Not Sure", point: -1, action: "CONTINUE" },
    ],
  },
  {
    id: 7,
    order: 7,
    title: "Primary Requirement",
    questionText: "What is the student primarily looking for?",
    isActive: true,
    options: [
      { value: "placement_focused", label: "Placement-Focused Course", point: 1, action: "CONTINUE" },
      { value: "campus_degree", label: "Campus-Based Degree", point: 1, action: "CONTINUE" },
      { value: "exploring", label: "Still Exploring Options", point: 0, action: "CONTINUE" },
      { value: "no_answer", label: "Did Not Answer Clearly", point: -1, action: "CONTINUE" },
    ],
  },

  /* ---------------- PREPARATION ---------------- */
  {
    id: 8,
    order: 8,
    title: "Entrance Exam Status",
    questionText: "Has the student appeared in any entrance exam?",
    isActive: true,
    options: [
      { value: "appeared", label: "Yes, Appeared", point: 1, action: "CONTINUE" },
      { value: "planning", label: "Planning to Appear", point: 1, action: "CONTINUE" },
      { value: "not_required", label: "Not Required for Preferred Course", point: 0, action: "CONTINUE" },
      { value: "not_given", label: "Not Given", point: 0, action: "CONTINUE" },
    ],
  },

  /* ---------------- CONSTRAINTS ---------------- */
  {
    id: 9,
    order: 9,
    title: "Mode of Education",
    questionText: "Which mode of education is preferred?",
    isActive: true,
    options: [
      { value: "offline", label: "Offline / Regular", point: 1, action: "CONTINUE" },
      { value: "online", label: "Online", point: 1, action: "CONTINUE" },
      { value: "distance", label: "Distance Course", point: 1, action: "CONTINUE" },
      { value: "not_decided", label: "Not Decided", point: 0, action: "CONTINUE" },
    ],
  },
  {
    id: 10,
    order: 10,
    title: "Relocation Preference",
    questionText: "What is the relocation preference?",
    isActive: true,
    options: [
      { value: "same_city", label: "Same City Only", point: 1, action: "CONTINUE" },
      { value: "same_state", label: "Same State", point: 1, action: "CONTINUE" },
      { value: "any_city", label: "Ready to Move Anywhere", point: 1, action: "CONTINUE" },
      { value: "not_decided", label: "Not Decided", point: 0, action: "CONTINUE" },
    ],
  },
  {
    id: 11,
    order: 11,
    title: "Hostel Requirement",
    questionText: "Does the student require hostel accommodation?",
    isActive: true,
    options: [
      { value: "hostel_yes", label: "Yes", point: 1, action: "CONTINUE" },
      { value: "hostel_no", label: "No", point: 1, action: "CONTINUE" },
      { value: "hostel_unsure", label: "Not Sure", point: 0, action: "CONTINUE" },
    ],
  },

  /* ---------------- FINANCIAL FIT ---------------- */
  {
    id: 12,
    order: 12,
    title: "Budget Range",
    questionText: "What is the expected budget range?",
    isActive: true,
    options: [
      { value: "budget_2_4", label: "₹2 – 4 Lakh", point: 1, action: "CONTINUE" },
      { value: "budget_4_8", label: "₹4 – 8 Lakh", point: 1, action: "CONTINUE" },
      { value: "budget_8_10", label: "₹8 – 10 Lakh", point: 1, action: "CONTINUE" },
      { value: "budget_10_plus", label: "₹10+ Lakh", point: 1, action: "CONTINUE" },
      { value: "loan_required", label: "Need Education Loan", point: 0, action: "CONTINUE" },
      { value: "prefer_not_say", label: "Prefer Not to Say", point: -1, action: "CONTINUE" },
    ],
  },

  /* ---------------- URGENCY & DECISION ---------------- */
  {
    id: 13,
    order: 13,
    title: "Joining Timeline",
    questionText: "When is the student planning to take admission?",
    isActive: true,
    options: [
      { value: "immediate", label: "This Intake (0–30 Days)", point: 1, action: "CONTINUE" },
      { value: "one_to_three", label: "Next 1 – 3 Months", point: 1, action: "CONTINUE" },
      { value: "three_plus", label: "After 3+ Months", point: 0, action: "CONTINUE" },
      { value: "not_sure", label: "Not Sure Yet", point: 0, action: "CONTINUE" },
    ],
  },
  {
    id: 14,
    order: 14,
    title: "Decision Authority",
    questionText: "Who will take the final admission decision?",
    isActive: true,
    options: [
      { value: "self", label: "Self", point: 1, action: "CONTINUE" },
      { value: "parent", label: "Parent / Guardian", point: 1, action: "CONTINUE" },
      { value: "joint", label: "Joint Decision", point: 0, action: "CONTINUE" },
      { value: "not_decided", label: "Not Decided Yet", point: -1, action: "CONTINUE" },
    ],
  },

  /* ---------------- CONVERSION INTELLIGENCE ---------------- */
  {
    id: 15,
    order: 15,
    title: "Previous Counseling",
    questionText: "Has the student spoken to other colleges or counselors?",
    isActive: true,
    options: [
      { value: "yes_multiple", label: "Yes, Multiple Colleges", point: 1, action: "CONTINUE" },
      { value: "one_college", label: "Spoken to One College", point: 1, action: "CONTINUE" },
      { value: "first_time", label: "First Time Counseling", point: 0, action: "CONTINUE" },
    ],
  },
  {
    id: 16,
    order: 16,
    title: "Admission Readiness",
    questionText: "How ready is the student for admission?",
    isActive: true,
    options: [
      { value: "ready_now", label: "Ready to Take Admission Now", point: 1, action: "CONTINUE" },
      { value: "comparing", label: "Comparing Colleges", point: 1, action: "CONTINUE" },
      { value: "just_exploring", label: "Just Exploring", point: 0, action: "CONTINUE" },
      { value: "not_interested", label: "Not Interested", point: -1, action: "STOP_CONVERSATION" },
    ],
  },
];

export const TravelQuestions = [
  {
    id: 101,
    order: 1,
    title: "Travel Purpose",
    questionText: "What is the primary purpose of travel?",
    isActive: true,
    options: [
      { value: "leisure", label: "Leisure / Vacation", point: 1, action: "CONTINUE" },
      { value: "business", label: "Business Trip", point: 1, action: "CONTINUE" },
      { value: "study", label: "Study / Education", point: 1, action: "CONTINUE" },
      { value: "family_visit", label: "Family Visit", point: 0, action: "CONTINUE" },
    ],
  },
  {
    id: 102,
    order: 2,
    title: "Destination Preference",
    questionText: "Which type of destination is preferred?",
    isActive: true,
    options: [
      { value: "domestic", label: "Domestic", point: 1, action: "CONTINUE" },
      { value: "international", label: "International", point: 2, action: "CONTINUE" },
      { value: "both", label: "Open to Both", point: 1, action: "CONTINUE" },
      { value: "not_decided", label: "Not Decided", point: 0, action: "CONTINUE" },
    ],
  },
  {
    id: 103,
    order: 3,
    title: "Travel Timeline",
    questionText: "When are they planning to travel?",
    isActive: true,
    options: [
      { value: "immediate", label: "Within 1 Month", point: 2, action: "CONTINUE" },
      { value: "one_to_three", label: "1–3 Months", point: 1, action: "CONTINUE" },
      { value: "three_plus", label: "3+ Months", point: 0, action: "CONTINUE" },
      { value: "not_sure", label: "Not Sure", point: 0, action: "CONTINUE" },
    ],
  },
  {
    id: 104,
    order: 4,
    title: "Budget Range",
    questionText: "What is the approximate travel budget?",
    isActive: true,
    options: [
      { value: "budget_low", label: "Budget-Friendly", point: 0, action: "CONTINUE" },
      { value: "mid_range", label: "Mid-Range", point: 1, action: "CONTINUE" },
      { value: "luxury", label: "Luxury Travel", point: 2, action: "CONTINUE" },
      { value: "not_disclosed", label: "Prefer Not to Say", point: -1, action: "CONTINUE" },
    ],
  },
  {
    id: 105,
    order: 5,
    title: "Travel Readiness",
    questionText: "How ready is the traveler to book?",
    isActive: true,
    options: [
      { value: "ready_now", label: "Ready to Book Now", point: 2, action: "CONTINUE" },
      { value: "researching", label: "Still Researching Options", point: 1, action: "CONTINUE" },
      { value: "just_exploring", label: "Just Exploring", point: 0, action: "CONTINUE" },
      { value: "not_interested", label: "Not Interested", point: -2, action: "STOP_CONVERSATION" },
    ],
  },
];

export const FinanceQuestions = [
  {
    id: 201,
    order: 1,
    title: "Financial Goal",
    questionText: "What is the primary financial goal?",
    isActive: true,
    options: [
      { value: "investment", label: "Investment Growth", point: 2, action: "CONTINUE" },
      { value: "loan", label: "Loan Requirement", point: 1, action: "CONTINUE" },
      { value: "savings", label: "Savings / Wealth Planning", point: 1, action: "CONTINUE" },
      { value: "insurance", label: "Insurance Planning", point: 1, action: "CONTINUE" },
    ],
  },
  {
    id: 202,
    order: 2,
    title: "Monthly Income Range",
    questionText: "What is the approximate monthly income range?",
    isActive: true,
    options: [
      { value: "below_25k", label: "Below ₹25k", point: 0, action: "CONTINUE" },
      { value: "25k_50k", label: "₹25k – ₹50k", point: 1, action: "CONTINUE" },
      { value: "50k_1l", label: "₹50k – ₹1L", point: 1, action: "CONTINUE" },
      { value: "above_1l", label: "Above ₹1L", point: 2, action: "CONTINUE" },
    ],
  },
  {
    id: 203,
    order: 3,
    title: "Risk Appetite",
    questionText: "What is the risk tolerance level?",
    isActive: true,
    options: [
      { value: "low", label: "Low Risk", point: 0, action: "CONTINUE" },
      { value: "moderate", label: "Moderate Risk", point: 1, action: "CONTINUE" },
      { value: "high", label: "High Risk", point: 2, action: "CONTINUE" },
      { value: "not_sure", label: "Not Sure", point: 0, action: "CONTINUE" },
    ],
  },
  {
    id: 204,
    order: 4,
    title: "Investment Timeline",
    questionText: "What is the preferred investment duration?",
    isActive: true,
    options: [
      { value: "short_term", label: "0–1 Year", point: 0, action: "CONTINUE" },
      { value: "mid_term", label: "1–3 Years", point: 1, action: "CONTINUE" },
      { value: "long_term", label: "3+ Years", point: 2, action: "CONTINUE" },
      { value: "flexible", label: "Flexible", point: 1, action: "CONTINUE" },
    ],
  },
  {
    id: 205,
    order: 5,
    title: "Decision Readiness",
    questionText: "How ready is the user to take a financial decision?",
    isActive: true,
    options: [
      { value: "ready_now", label: "Ready Now", point: 2, action: "CONTINUE" },
      { value: "need_consultation", label: "Need Expert Consultation", point: 1, action: "CONTINUE" },
      { value: "researching", label: "Still Researching", point: 0, action: "CONTINUE" },
      { value: "not_interested", label: "Not Interested", point: -2, action: "STOP_CONVERSATION" },
    ],
  },
];

export const HealthQuestions = [
  {
    id: 301,
    order: 1,
    title: "Health Goal",
    questionText: "What is the primary health goal?",
    isActive: true,
    options: [
      { value: "weight_loss", label: "Weight Loss", point: 1, action: "CONTINUE" },
      { value: "fitness", label: "General Fitness", point: 1, action: "CONTINUE" },
      { value: "medical_support", label: "Medical Condition Support", point: 2, action: "CONTINUE" },
      { value: "mental_wellness", label: "Mental Wellness", point: 1, action: "CONTINUE" },
    ],
  },
  {
    id: 302,
    order: 2,
    title: "Current Health Status",
    questionText: "How would you describe the current health condition?",
    isActive: true,
    options: [
      { value: "healthy", label: "Generally Healthy", point: 1, action: "CONTINUE" },
      { value: "minor_issues", label: "Minor Health Issues", point: 1, action: "CONTINUE" },
      { value: "chronic_condition", label: "Chronic Condition", point: 2, action: "CONTINUE" },
      { value: "prefer_not_say", label: "Prefer Not to Say", point: 0, action: "CONTINUE" },
    ],
  },
  {
    id: 303,
    order: 3,
    title: "Consultation Preference",
    questionText: "Preferred mode of health consultation?",
    isActive: true,
    options: [
      { value: "online", label: "Online Consultation", point: 1, action: "CONTINUE" },
      { value: "offline", label: "In-Person Visit", point: 1, action: "CONTINUE" },
      { value: "both", label: "Open to Both", point: 1, action: "CONTINUE" },
      { value: "not_decided", label: "Not Decided", point: 0, action: "CONTINUE" },
    ],
  },
  {
    id: 304,
    order: 4,
    title: "Urgency Level",
    questionText: "How urgent is the health requirement?",
    isActive: true,
    options: [
      { value: "immediate", label: "Immediate", point: 2, action: "CONTINUE" },
      { value: "soon", label: "Within Few Weeks", point: 1, action: "CONTINUE" },
      { value: "routine", label: "Routine Checkup", point: 0, action: "CONTINUE" },
      { value: "not_sure", label: "Not Sure", point: 0, action: "CONTINUE" },
    ],
  },
  {
    id: 305,
    order: 5,
    title: "Program Readiness",
    questionText: "How ready is the person to start a health program?",
    isActive: true,
    options: [
      { value: "ready_now", label: "Ready to Start Now", point: 2, action: "CONTINUE" },
      { value: "considering", label: "Considering Options", point: 1, action: "CONTINUE" },
      { value: "just_exploring", label: "Just Exploring", point: 0, action: "CONTINUE" },
      { value: "not_interested", label: "Not Interested", point: -2, action: "STOP_CONVERSATION" },
    ],
  },
];