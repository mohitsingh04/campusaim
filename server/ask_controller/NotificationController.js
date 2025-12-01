import Notification from "../ask_model/Notification.js";
import RegularUser from "../profile-model/RegularUser.js";
import { getDataFromToken } from "../utils/getDataFromToken.js";
import Category from "../models/Category.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);

        // 1. Fetch notifications
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .lean();

        // 2. Collect unique sender and category IDs
        const senderIds = [...new Set(notifications.map(n => n.sender).filter(Boolean))];
        const categoryIds = [...new Set(notifications.map(n => n.category).filter(Boolean))];

        // 3. Batch fetch from other databases
        // Assume you have RegularUser and Category models from other DBs
        const [senders, categories] = await Promise.all([
            RegularUser.find({ _id: { $in: senderIds } }).select("name username avatar").lean(),
            Category.find({ _id: { $in: categoryIds } }).select("category_name slug").lean()
        ]);

        // 4. Map by ID for quick lookup
        const senderMap = Object.fromEntries(senders.map(u => [u._id.toString(), u]));
        const categoryMap = Object.fromEntries(categories.map(c => [c._id.toString(), c]));

        // 5. Attach to notifications
        const enriched = notifications.map(n => ({
            ...n,
            sender: n.sender ? senderMap[n.sender.toString()] : null,
            category: n.category ? categoryMap[n.category.toString()] : null
        }));

        return res.status(200).json(enriched);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
