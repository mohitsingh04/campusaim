import express from "express";
import { getMyNotifications, getUnreadCount, markAllNotificationsRead, markNotificationRead } from "../controller/notificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const notificationRouter = express.Router();

notificationRouter.get("/notifications", authMiddleware, getMyNotifications);
notificationRouter.get("/notifications/unread-count", authMiddleware, getUnreadCount);
notificationRouter.patch("/notifications/:id/read", authMiddleware, markNotificationRead);
notificationRouter.patch("/notifications/read-all", authMiddleware, markAllNotificationsRead);

export default notificationRouter;