import Notification from "../models/notificationModel.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import mongoose from "mongoose";

export const getMyNotifications = async (req, res) => {
    try {
        const receiverId = await getDataFromToken(req);

        // ✅ VALIDATION
        if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access",
            });
        }

        const notifications = await Notification
            .find({ receiverId })
            .populate("senderId", "name avatar email") // Fetch sender details for the UI
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: notifications
        });

    } catch (error) {
        console.error("Fetch Notifications Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications"
        });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        const receiverId = await getDataFromToken(req);

        const notification = await Notification.findOneAndUpdate(
            { _id: id, receiverId },
            {
                read: true,
                readAt: new Date()
            },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found or unauthorized"
            });
        }

        return res.json({
            success: true,
            data: notification
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update notification"
        });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const receiverId = await getDataFromToken(req);

        const count = await Notification.countDocuments({
            receiverId,
            read: false
        });

        return res.json({
            success: true,
            unread: count
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch unread count"
        });
    }
};

export const markAllNotificationsRead = async (req, res) => {
    try {
        const receiverId = await getDataFromToken(req);

        const result = await Notification.updateMany(
            { receiverId, read: false },
            {
                read: true,
                readAt: new Date()
            }
        );

        return res.json({
            success: true,
            updated: result.modifiedCount
        });

    } catch (err) {
        console.error("Mark All Read Error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to mark all notifications as read"
        });
    }
};