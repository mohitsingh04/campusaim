import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const notificationSchema = new mongoose.Schema(
    {
        // The Recipient (User receiving the notification)
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        // The Initiator (The "Actor" who triggered the event)
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null // null indicates a system-generated event
        },

        type: {
            type: String,
            required: true,
            enum: [
                "lead_assigned",
                "lead_reassigned",
                "lead_status_changed",
                "lead_comment",
                "followup_reminder",
                "goal_achieved",
                "user_added",
                "admin_registered",
                "system_announcement",
                "counselor_assigned",
                "team_member_added",
                "lead_action",
                "lead_created",
                "lead_activity",
                "partner_registered",
                "assigned_goal"
            ]
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },

        link: {
            type: String,
            default: null
        },

        meta: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        read: {
            type: Boolean,
            default: false,
        },

        readAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Notification = db.model("Notification", notificationSchema);
export default Notification;
