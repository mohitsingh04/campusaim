export const FIELD_TYPES = {
    INPUT: "input",
    SELECT: "select",
    DATE: "date",
    PHONE: "phone"
};

// reusable options
const BOARDS = ["CBSE", "ICSE", "IB", "Cambridge", "State Board"];
const GENDER_OPTIONS = ["Male", "Female", "Other"];
const STREAM_OPTIONS = ["Science", "Commerce", "Arts"];
const COLLEGE_TYPES = ["Government", "Semi-Government", "Private", "Deemed", "Autonomous", "Any"];

// ================= SCHEMA =================
export const FORM_SCHEMA = {
    // ================= SCHOOL =================
    school: {
        sections: {
            basic: { title: "Basic Information" },
            schoolInfo: { title: "Basic School Information" },
            preferences: { title: "School Preference Section" }
        },

        basic: [
            { name: "name", label: "Student Name", type: FIELD_TYPES.INPUT, required: true, placeholder: "Enter full name" },
            { name: "contact", label: "Contact Number", type: FIELD_TYPES.PHONE, codeName: "countryCode", required: true, placeholder: "Enter contact number" },
            { name: "email", label: "Email", type: FIELD_TYPES.INPUT, inputType: "email", placeholder: "Enter email address" },
            { name: "alternateContact", label: "Alternate Contact Number", type: FIELD_TYPES.PHONE, codeName: "countryCode", placeholder: "Enter alt. contact number" },
            { name: "gender", label: "Gender", type: FIELD_TYPES.SELECT, options: GENDER_OPTIONS },
            { name: "dob", label: "Date of Birth", type: FIELD_TYPES.DATE }
        ],

        schoolInfo: [
            { name: "school.currentName", label: "Current School Name", type: FIELD_TYPES.INPUT, placeholder: "Enter school name" },
            { name: "school.currentLocation", label: "Current School Location", type: FIELD_TYPES.INPUT, placeholder: "Enter city or area" },
            { name: "school.board", label: "Board Type", type: FIELD_TYPES.SELECT, options: BOARDS },
            {
                name: "school.currentClass",
                label: "Current Class",
                type: FIELD_TYPES.SELECT,
                options: ["Nursery", "KG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"]
            },
            { name: "school.session", label: "Academic Session", type: FIELD_TYPES.INPUT, placeholder: "2024-25" },
            { name: "school.percentage", label: "Current Percentage/Grade", type: FIELD_TYPES.INPUT, placeholder: "Enter percentage/grade" }
        ],

        preferences: [
            { name: "preferences.preferredSchool", label: "Interested School", type: FIELD_TYPES.INPUT, placeholder: "Enter interested school" },
            {
                name: "preferences.schoolType",
                label: "Preferred School Type",
                type: FIELD_TYPES.SELECT,
                options: ["Boarding School", "Day Boarding", "International School", "Residential School"]
            },
            { name: "preferences.location", label: "Preferred Location", type: FIELD_TYPES.INPUT, placeholder: "Enter city or area" },
            {
                name: "preferences.admissionClass",
                label: "Admission Class",
                type: FIELD_TYPES.SELECT,
                options: ["Nursery", "KG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"]
            },
            { name: "preferences.session", label: "Academic Session Applying For", type: FIELD_TYPES.INPUT, placeholder: "2025-26" },
            {
                name: "preferences.hostel",
                label: "Hostel Required?",
                type: FIELD_TYPES.SELECT,
                options: ["Yes", "No"]
            }
        ]
    },

    // ================= COLLEGE / UNIVERSITY =================
    college_university: {
        sections: {
            basic: { title: "Basic Information" },
            location: { title: "Address & Location" },
            academics: { title: "Academic Details" },
            preferences: { title: "Course & Institution Preferences" }
        },

        basic: [
            { name: "name", label: "Name", type: FIELD_TYPES.INPUT, required: true, placeholder: "Enter full name" },
            { name: "email", label: "Email", type: FIELD_TYPES.INPUT, inputType: "email", placeholder: "Enter email address" },
            { name: "contact", label: "Contact Number", type: FIELD_TYPES.PHONE, required: true, codeName: "countryCode", placeholder: "Enter contact number" },
            { name: "alternateContact", label: "Alternate Contact Number", type: FIELD_TYPES.PHONE, codeName: "countryCode", placeholder: "Enter alt. contact number" },
            { name: "gender", label: "Gender", type: FIELD_TYPES.SELECT, options: GENDER_OPTIONS },
            { name: "dob", label: "Date of Birth", type: FIELD_TYPES.DATE }
        ],

        location: [
            { name: "address", label: "Address", type: FIELD_TYPES.INPUT },
            { name: "pincode", label: "Pincode", type: FIELD_TYPES.INPUT },
            {
                name: "country",
                label: "Country",
                type: FIELD_TYPES.SELECT,
                dynamic: "countries",
                labelKey: "country_name",
                valueKey: "country_name"
            },
            {
                name: "state",
                label: "State",
                type: FIELD_TYPES.SELECT,
                dynamic: "states",
                labelKey: "name",
                valueKey: "name"
            },
            {
                name: "city",
                label: "City",
                type: FIELD_TYPES.SELECT,
                dynamic: "cities",
                labelKey: "name",
                valueKey: "name"
            }
        ],

        academics: [
            { name: "academics.qualification", label: "Qualification", type: FIELD_TYPES.INPUT, placeholder: "e.g. 10th, 12th, B.Tech" },
            { name: "academics.boardOrUniversity", label: "Board/University", type: FIELD_TYPES.INPUT, placeholder: "e.g. CBSE, ICSE, Delhi University" },
            { name: "academics.passingYear", label: "Passing Year", type: FIELD_TYPES.INPUT, inputType: "number", placeholder: "e.g. 2024" },
            { name: "academics.percentage", label: "Percentage", type: FIELD_TYPES.INPUT, inputType: "number", placeholder: "e.g. 85" },
            { name: "academics.stream", label: "Stream", type: FIELD_TYPES.SELECT, options: STREAM_OPTIONS, placeholder: "Select stream" }
        ],

        preferences: [
            {
                name: "preferences.preferredCountry",
                label: "Preferred Country",
                type: FIELD_TYPES.SELECT,
                dynamic: "countries",
                labelKey: "country_name",
                valueKey: "country_name"
            },
            {
                name: "preferences.preferredState",
                label: "Preferred State",
                type: FIELD_TYPES.SELECT,
                dynamic: "states",
                labelKey: "name",
                valueKey: "name"
            },
            {
                name: "preferences.preferredCity",
                label: "Preferred City",
                type: FIELD_TYPES.SELECT,
                dynamic: "cities",
                labelKey: "name",
                valueKey: "name"
            },
            {
                name: "preferences.preferredProperty",
                label: "Interested College/University",
                type: FIELD_TYPES.SELECT,
                dynamic: "properties",
                labelKey: "property_name",
                valueKey: "_id",
                allowOther: true
            },
            {
                name: "preferences.preferredCourse",
                label: "Interested Course",
                type: FIELD_TYPES.SELECT,
                dynamic: "courses",
                labelKey: "course_name",
                valueKey: "_id",
                allowOther: true
            },
            {
                name: "preferences.collegeType",
                label: "Preferred College Type",
                type: FIELD_TYPES.SELECT,
                options: COLLEGE_TYPES
            }
        ]
    },

    // ================= COACHING =================
    coaching: {
        sections: {
            basic: { title: "Basic Information" },
            schoolInfo: { title: "School Information" },
            exam: { title: "Coaching Preferences" }
        },

        basic: [
            { name: "name", label: "Student Full Name", type: FIELD_TYPES.INPUT, required: true, placeholder: "Enter full name" },
            { name: "contact", label: "Contact Number", type: FIELD_TYPES.PHONE, required: true, codeName: "countryCode", placeholder: "Enter contact number" },
            { name: "alternateContact", label: "Alternate Contact Number", type: FIELD_TYPES.PHONE, codeName: "countryCode", placeholder: "Enter alt. contact number" },
            { name: "email", label: "Email Address", type: FIELD_TYPES.INPUT, inputType: "email", placeholder: "Enter email address" },
            { name: "gender", label: "Gender", type: FIELD_TYPES.SELECT, options: GENDER_OPTIONS },
            { name: "dob", label: "Date of Birth", type: FIELD_TYPES.DATE }
        ],

        schoolInfo: [
            {
                name: "school.currentClass",
                label: "Current Class",
                type: FIELD_TYPES.SELECT,
                options: ["6th", "9th", "10th", "11th", "12th"]
            },
            {
                name: "school.board",
                label: "Board",
                type: FIELD_TYPES.SELECT,
                options: ["CBSE", "ICSE", "State Board"]
            },
            {
                name: "school.percentage",
                label: "Recent Percentage/Grade",
                type: FIELD_TYPES.INPUT,
                placeholder: "e.g. 85"
            }
        ],

        exam: [
            {
                name: "exam.examType",
                label: "Exam Preparing For",
                type: "multi_select", // 👈 NEW TYPE
                options: ["NDA", "CDS", "Sainik School", "RMS", "RIMC"],
                allowOther: true
            },
            { name: "exam.location", label: "Preferred Coaching Location", type: FIELD_TYPES.INPUT, placeholder: "Enter interested location" },
            { name: "exam.mode", label: "Coaching Mode", type: FIELD_TYPES.SELECT, options: ["Online", "Offline"] },
            { name: "exam.batch", label: "Preferred Batch", type: FIELD_TYPES.SELECT, options: ["Morning", "Evening"] },
            { name: "exam.hostel", label: "Hostel Required?", type: FIELD_TYPES.SELECT, options: ["Yes", "No"], renderIf: (values) => values?.exam?.mode === "Offline" },
            { name: "exam.transport", label: "Transportation Required?", type: FIELD_TYPES.SELECT, options: ["Yes", "No"], renderIf: (values) => values?.exam?.mode === "Offline" }
        ]
    }
};