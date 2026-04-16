import React, { useEffect, useState } from "react";
import { API } from "../../../services/API";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import NotificationSkeleton from "./NotificationSkeleton";

export default function Notification({ refreshUnread, onClose }) {

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await API.get("/notifications");

            setNotifications(res.data.data || []);
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to load notifications";

            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {

            await API.patch(`/notifications/${id}/read`);

            setNotifications((prev) =>
                prev.map((n) =>
                    n._id === id ? { ...n, read: true } : n
                )
            );

            refreshUnread();

        } catch (error) {
            toast.error("Failed to mark notification as read");
        }
    };

    if (loading) {
        return <NotificationSkeleton />;;
    }

    if (!notifications.length) {
        return (
            <div className="p-6 text-center text-gray-500 text-sm">
                No notifications
            </div>
        );
    }

    // show only 10
    const latestNotifications = notifications.slice(0, 10);

    return (
        <div className="flex flex-col max-h-96">
            {/* Notification list */}
            <div className="overflow-y-auto">
                {latestNotifications.map((n) => (
                    <div
                        key={n._id}
                        className={`px-4 py-3 border-b text-sm flex items-start justify-between gap-3
                        ${!n.read ? "bg-blue-50" : "bg-white"}`}
                    >
                        <div className="flex-1">
                            <p className="font-medium text-gray-800">
                                {n.title}
                            </p>
                            <p className="text-gray-600 text-xs">
                                {n.message}
                            </p>
                        </div>

                        {/* {!n.read && (
                            <button
                                onClick={() => markAsRead(n._id)}
                                className="text-green-600 hover:text-green-800"
                                title="Mark as read"
                            >
                                <Check size={16} />
                            </button>
                        )} */}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="border-t bg-gray-50 text-center">
                <Link
                    to="/dashboard/notifications"
                    onClick={onClose}
                    className="block py-2 text-sm font-medium text-blue-600 hover:bg-gray-100"
                >
                    View all notifications
                </Link>
            </div>
        </div>
    );
}