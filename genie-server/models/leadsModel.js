import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const { Schema } = mongoose;

// Admission Sub-Schema
const AdmissionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", default: null },
    collegeId: { type: Schema.Types.ObjectId, ref: "College", default: null },
    confirmedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    confirmedAt: { type: Date, default: null },
}, { _id: false });

/* -------------------------------------------------- */
/* Assignment History Sub-Schema                      */
/* -------------------------------------------------- */
const AssignmentHistorySchema = new Schema(
    {
        assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
        assignedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["admin", "teamleader"], required: true },
        assignedOn: { type: Date, default: Date.now },
    },
    { _id: false }
);

// Contact History Sub-Schema
const ContactHistorySchema = new Schema(
    {
        contactedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        contactedAt: { type: Date, default: Date.now },
        mode: {
            type: String,
            enum: ["call", "whatsapp", "email", "sms", "meeting", "other"],
            default: "call"
        },
        note: { type: String, trim: true, maxlength: 500 }
    },
    { _id: false }
);

/* -------------------------------------------------- */
/* Course Preference Sub-Schema                       */
/* -------------------------------------------------- */
const CoursePreferenceSchema = new Schema(
    {
        courseName: { type: String, trim: true, maxlength: 120 },

        courseType: {
            type: String,
            enum: ["UG", "PG", "Diploma", "Certificate", "PhD", "Other"],
        },

        specialization: { type: String, trim: true, maxlength: 120 },

        preferredState: { type: String, trim: true, maxlength: 80 },

        preferredCity: { type: String, trim: true, maxlength: 80 },

        collegeType: {
            type: String,
            enum: ["Government", "Private", "Deemed", "Autonomous", "Any"],
            default: "Any",
        },
    },
    { _id: false }
);

/* -------------------------------------------------- */
/* Academic Details Sub-Schema                        */
/* -------------------------------------------------- */
const AcademicSchema = new Schema(
    {
        qualification: { type: String, trim: true, maxlength: 100 },

        boardOrUniversity: { type: String, trim: true, maxlength: 120 },

        passingYear: {
            type: Number,
            min: 1980,
            max: new Date().getFullYear() + 1,
        },

        percentage: { type: Number, min: 0, max: 100 },

        stream: { type: String, trim: true, maxlength: 80 },
    },
    { _id: false }
);

/* -------------------------------------------------- */
/* Marketing Attribution Sub-Schema                   */
/* -------------------------------------------------- */
const MarketingSchema = new Schema(
    {
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
    },
    { _id: false }
);

/* -------------------------------------------------- */
/* Lead Schema                                        */
/* -------------------------------------------------- */
const LeadSchema = new Schema(
    {
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            default: null,
        },

        teamLeader: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        property_id: { type: Schema.Types.ObjectId, default: null },
        course_id: { type: Schema.Types.ObjectId, default: null },

        /* 📇 Canonical Safe Fields */
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },

        contact: {
            type: String,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            set: (v) => v || null,
        },

        /* 📍 Address */
        address: { type: String, trim: true, maxlength: 150 },
        city: { type: String, trim: true, maxlength: 80 },
        state: { type: String, trim: true, maxlength: 80 },
        pincode: { type: String, trim: true },

        /* 🎓 Academic Details */
        academics: AcademicSchema,

        /* 🎯 Course Preferences */
        preferences: CoursePreferenceSchema,

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

        /* 🏁 Application Tracking */
        applicationDoneBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        applicationFilledAt: {
            type: Date,
            default: null,
        },

        /* 🏁 Conversion Tracking */
        convertedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        convertedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

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