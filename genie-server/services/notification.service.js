import Notification from "../models/notificationModel.js";

export const createNotification = async ({
    receiverId,      // Changed from userId
    senderId = null,
    type,
    title,
    message,
    link = null,
    meta = {}
}) => {
    try {
        if (!receiverId || !type || !title || !message) {
            throw new Error("Missing required notification fields");
        }

        const notification = await Notification.create({
            receiverId,
            senderId,
            type,
            title,
            message,
            link,
            meta
        });

        return notification;
    } catch (error) {
        console.error("Notification service error:", error);
    }
};