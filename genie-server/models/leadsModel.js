import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const { Schema } = mongoose;

// Admission Sub-Schema
const AdmissionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "user", default: null },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", default: null },
    collegeId: { type: Schema.Types.ObjectId, ref: "College", default: null },
    confirmedBy: { type: Schema.Types.ObjectId, ref: "user", default: null },
    confirmedAt: { type: Date, default: null },
}, { _id: false });

/* -------------------------------------------------- */
/* Assignment History Sub-Schema                      */
/* -------------------------------------------------- */
const AssignmentHistorySchema = new Schema({
    assignedTo: { type: Schema.Types.ObjectId, ref: "user", default: null },
    assignedBy: { type: Schema.Types.ObjectId, ref: "user", required: true },
    role: { type: String, enum: ["admin", "teamleader"], required: true, default: null },
    assignedOn: { type: Date, default: Date.now },
}, { _id: false });

// Contact History Sub-Schema
const ContactHistorySchema = new Schema({
    contactedBy: { type: Schema.Types.ObjectId, ref: "user", required: true },
    contactedAt: { type: Date, default: Date.now },
    mode: {
        type: String,
        enum: ["call", "whatsapp", "email", "sms", "meeting", "other"],
        default: "call"
    },
    note: { type: String, trim: true, maxlength: 500 }
});

/* -------------------------------------------------- */
/* Preference Sub-Schema                       */
/* -------------------------------------------------- */
const PreferenceSchema = new Schema({
    preferredProperty: {
        type: Schema.Types.Mixed // ObjectId OR String (for "Other")
    },

    preferredCourse: {
        type: Schema.Types.Mixed
    },

    preferredCountry: { type: String, trim: true, maxlength: 80 },
    preferredState: { type: String, trim: true, maxlength: 80 },
    preferredCity: { type: String, trim: true, maxlength: 80 },

    collegeType: {
        type: String,
        enum: ["Government", "Semi-Government", "Private", "Deemed", "Autonomous", "Any"],
        default: "Any",
    },

    preferredSchool: { type: String, trim: true },
    schoolType: { type: String, trim: true },
    location: { type: String, trim: true },
    admissionClass: { type: String, trim: true },
    session: { type: String, trim: true },
    hostel: { type: String, enum: ["Yes", "No"], default: null },
}, { _id: false });

/* -------------------------------------------------- */
/* Academic Details Sub-Schema                        */
/* -------------------------------------------------- */
const AcademicSchema = new Schema({
    qualification: { type: String, trim: true, maxlength: 100 },

    boardOrUniversity: { type: String, trim: true, maxlength: 120 },

    passingYear: {
        type: Number,
        min: 1980,
        max: new Date().getFullYear() + 1,
    },

    percentage: { type: Number, min: 0, max: 100 },

    stream: { type: String, trim: true, maxlength: 80 },
}, { _id: false });

/* -------------------------------------------------- */
/* Marketing Attribution Sub-Schema                   */
/* -------------------------------------------------- */
const MarketingSchema = new Schema({
    platform: {
        type: String,
        enum: [
            "website",
            "facebook",
            "instagram",
            "google",
            "youtube",
            "linkedin",
            "whatsapp",
            "referral",
            "partner",
            "offline",
            "other",
        ],
        default: "website",
    },

    source: {
        type: String,
        trim: true,
        maxlength: 120,
        // facebook-ads
        // google-search
        // instagram-reel
        // website-form
    },

    campaign: {
        type: String,
        trim: true,
        maxlength: 120,
        // BTech-Admission-2026
        // MBA-Delhi-Campaign
    },

    medium: {
        type: String,
        trim: true,
        maxlength: 80,
        // cpc / organic / referral / social
    },

    referrer: {
        type: String,
        trim: true,
        maxlength: 255,
        // google.com / facebook.com
    },

    utm: {
        source: { type: String, trim: true },
        medium: { type: String, trim: true },
        campaign: { type: String, trim: true },
        term: { type: String, trim: true },
        content: { type: String, trim: true },
    },
}, { _id: false });

// School Sub-Schema
const SchoolSchema = new Schema({
    currentName: { type: String, trim: true },
    currentLocation: { type: String, trim: true },
    board: { type: String, trim: true },
    currentClass: { type: String, trim: true },
    session: { type: String, trim: true },
    percentage: { type: String, trim: true },
}, { _id: false });

// Exam Sub-Schema
const ExamSchema = new Schema({
    examType: [{ type: String, trim: true }],
    location: { type: String, trim: true },
    mode: { type: String, enum: ["Online", "Offline"], default: null },
    batch: { type: String, enum: ["Morning", "Evening"], default: null },
    hostel: { type: String, enum: ["Yes", "No"], default: null },
    transport: { type: String, enum: ["Yes", "No"], default: null },
}, { _id: false });

/* -------------------------------------------------- */
/* Lead Schema                                        */
/* -------------------------------------------------- */
const LeadSchema = new Schema({
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: "Organization",
        default: null,
    },

    teamLeader: {
        type: Schema.Types.ObjectId,
        ref: "user",
        default: null,
    },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },

    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "user",
        default: null,
    },
    
    property_id: { type: Schema.Types.ObjectId, default: null },
    custom_property_name: { type: String, trim: true },

    course_id: { type: Schema.Types.ObjectId, default: null },
    custom_course_name: { type: String, trim: true },

    /* 📇 Canonical Safe Fields */
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },

    email: {
        type: String,
        trim: true,
        lowercase: true,
        set: (v) => v || null,
    },

    contact: {
        type: String,
        trim: true,
    },

    alternateContact: { type: String, trim: true },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        default: null
    },

    dob: { type: Date },

    category: {
        type: Schema.Types.ObjectId
    },

    /* 📍 Address */
    address: { type: String, trim: true, maxlength: 150 },
    city: { type: String, trim: true, maxlength: 80 },
    state: { type: String, trim: true, maxlength: 80 },
    country: { type: String, trim: true, maxlength: 80 },
    pincode: { type: String, trim: true },

    /* 🎓 Academic Details */
    academics: AcademicSchema,

    /* 🎯 Course & Institution Preferences */
    preferences: PreferenceSchema,

    /* 📊 Activity Tracking */
    lastActivity: {
        type: Date,
        default: null,
    },

    /* 🧭 Lead Entry Type (How lead entered system) */
    leadType: {
        type: String,
        enum: ["manual", "partner", "website", "api", "import", "external"],
        default: "manual",
    },

    /* 📢 Marketing Attribution */
    marketing: {
        type: MarketingSchema,
        default: () => ({}),
    },

    /* 🔐 RAW IMPORT DATA (Excel Sandbox) */
    rawImport: {
        type: Map,
        of: Schema.Types.Mixed,
        default: {},
        select: false,
    },

    importMeta: {
        fileName: { type: String, trim: true },
        uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
        uploadedAt: { type: Date },
        rowNumber: { type: Number },
    },

    /* 🧾 Assignment Audit */
    assignmentHistory: {
        type: [AssignmentHistorySchema],
        default: [],
    },

    /* 📊 Lead Status */
    status: {
        type: String,
        enum: ["new", "contacted", "applications_done", "converted", "lost"],
        default: "new",
    },

    admission: {
        type: AdmissionSchema,
        default: () => ({}),
    },

    contactHistory: {
        type: [ContactHistorySchema],
        default: []
    },

    school: {
        type: SchoolSchema,
        default: () => ({})
    },

    exam: {
        type: ExamSchema,
        default: () => ({})
    },

    /* 🏁 Application Tracking */
    applicationDoneBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
        default: null,
    },

    applicationFilledAt: {
        type: Date,
        default: null,
    },

    /* 🏁 Conversion Tracking */
    convertedBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
        default: null,
    },

    convertedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

/* -------------------------------------------------- */
/* Hooks                                              */
/* -------------------------------------------------- */
LeadSchema.pre("save", function (next) {
    try {
        /* Update lastActivity automatically */
        if (this.isModified() && !this.isModified("lastActivity")) {
            this.lastActivity = new Date();
        }

        /* Prevent assignmentHistory from growing indefinitely */
        if (this.assignmentHistory.length > 50) {
            this.assignmentHistory = this.assignmentHistory.slice(-50);
        }

        next();
    } catch (err) {
        next(err);
    }
});

/* -------------------------------------------------- */
/* Export Model                                       */
/* -------------------------------------------------- */
const Lead = db.model("Lead", LeadSchema);
export default Lead;