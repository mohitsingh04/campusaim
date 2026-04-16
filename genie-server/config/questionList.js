export const QuestionList = [
    {
        id: 1,
        order: 1,
        title: "Call Status",
        questionText: "What was the status of the call?",
        isActive: true,

        options: [
            {
                value: "call_continued",
                label: "Call continued",
                point: 1,
                action: "CONTINUE",
            },
            {
                value: "busy",
                label: "Busy",
                point: 0,
                action: "STOP_CONVERSATION",
            },
            {
                value: "cut",
                label: "Call Cut / Disconnected",
                point: -1,
                action: "STOP_CONVERSATION",
            },
            {
                value: "call_later",
                label: "Asked to Call Later",
                point: 0,
                action: "STOP_CONVERSATION",
            },
        ],
    },

    {
        id: 2,
        order: 2,
        title: "Lead Confirmation",
        questionText: "The inquiry is for whom?",
        isActive: true,

        options: [
            { value: "self_confirmed", label: "Yes, Right Person (Self)", point: 1, action: "CONTINUE" },
            { value: "different_person", label: "No, Different Person", point: -1, action: "CONTINUE" },
            { value: "guardian", label: "Guardian / Parent", point: 1, action: "CONTINUE" },
            { value: "not_sure", label: "Not Sure", point: -1, action: "CONTINUE" },
        ],
    },

    {
        id: 3,
        order: 3,
        title: "Mode of Education",
        questionText: "Which mode of education is preferred?",
        isActive: true,

        options: [
            { value: "online", label: "Online", point: 1, action: "CONTINUE" },
            { value: "offline", label: "Offline / Regular", point: 1, action: "CONTINUE" },
            { value: "distance", label: "Distance Course", point: 1, action: "CONTINUE" },
            { value: "not_decided", label: "Not Decided", point: 0, action: "CONTINUE" },
        ],
    },

    {
        id: 4,
        order: 4,
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

    {
        id: 5,
        order: 5,
        title: "Budget Range",
        questionText: "What is the expected budget range?",
        isActive: true,

        options: [
            { value: "budget_2_4", label: "₹2 – 4 Lakh", point: 1, action: "CONTINUE" },
            { value: "budget_4_8", label: "₹4 – 8 Lakh", point: 1, action: "CONTINUE" },
            { value: "budget_10_plus", label: "₹10+ Lakh", point: 1, action: "CONTINUE" },
            { value: "loan_required", label: "Need Education Loan", point: 0, action: "CONTINUE" },
            { value: "prefer_not_say", label: "Prefer Not to Say", point: -1, action: "CONTINUE" },
            { value: "joint_decision", label: "Joint Family Decision", point: 0, action: "CONTINUE" },
        ],
    },

    {
        id: 6,
        order: 6,
        title: "Joining Timeline",
        questionText: "When is the student planning to join?",
        isActive: true,

        options: [
            { value: "waiting_result", label: "Waiting for Result", point: 0, action: "CONTINUE" },
            { value: "immediate", label: "This Intake (0–30 Days)", point: 1, action: "CONTINUE" },
            { value: "one_to_three", label: "Next 1 – 3 Months", point: 1, action: "CONTINUE" },
            { value: "three_plus", label: "After 3+ Months", point: -1, action: "CONTINUE" },
            { value: "not_sure", label: "Not Sure Yet", point: 0, action: "CONTINUE" },
        ],
    },

    {
        id: 7,
        order: 7,
        title: "Relocation Preference",
        questionText: "What is the relocation preference?",
        isActive: true,

        options: [
            { value: "same_city", label: "Same City Only", point: 1, action: "CONTINUE" },
            { value: "same_state", label: "Same State", point: 1, action: "CONTINUE" },
            { value: "any_city", label: "Any City (Ready to Move)", point: 1, action: "CONTINUE" },
            { value: "not_decided", label: "Not Decided", point: 0, action: "CONTINUE" },
        ],
    },

    {
        id: 8,
        order: 8,
        title: "Hostel Requirement",
        questionText: "Does the student require hostel accommodation?",
        isActive: true,

        options: [
            { value: "hostel_yes", label: "Yes", point: 1, action: "CONTINUE" },
            { value: "hostel_no", label: "No", point: 1, action: "CONTINUE" },
            { value: "hostel_unsure", label: "Not Sure", point: 0, action: "CONTINUE" },
        ],
    },

    {
        id: 9,
        order: 9,
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
];