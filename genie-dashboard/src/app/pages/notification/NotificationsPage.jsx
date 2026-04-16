import React, { useEffect, useMemo, useState, useCallback } from "react";
import { API } from "../../services/API";
import toast from "react-hot-toast";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import { UserPlus, User, Bell, Target, MessageSquare, Clock } from "lucide-react";
import NotificationsPageSkeleton from "./NotificationsPageSkeleton";
import { Link } from "react-router-dom";

// relative time formatter
const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + " min ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + " hr ago";
    return Math.floor(seconds / 86400) + " days ago";
};

// notification icon map
const getNotificationIcon = (type) => {
    const base = { size: 18 };
    const icons = {
        lead_assigned: <Target {...base} className="text-blue-500" />,
        lead_comment: <MessageSquare {...base} className="text-purple-500" />,
        followup_reminder: <Clock {...base} className="text-orange-500" />,
        admin_registered: <UserPlus {...base} className="text-green-500" />,
        user_added: <User {...base} className="text-green-500" />
    };
    return icons[type] || <Bell {...base} className="text-gray-400" />;
};

export default function NotificationsPage() {

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    // fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            const res = await API.get("/notifications");
            setNotifications(res?.data?.data || []);
        } catch (err) {
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchNotifications() }, [fetchNotifications]);

    // mark single notification read
    const markAsRead = async (id) => {
        try {
            await API.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch {
            toast.error("Failed to update notification");
        }
    };

    // mark all notifications read
    const markAllRead = async () => {
        try {
            await API.patch("/notifications/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success("All notifications marked as read");
        } catch {
            toast.error("Failed to update notifications");
        }
    };

    // filter notifications
    const filteredNotifications = useMemo(() => {
        if (filter === "all") return notifications;
        if (filter === "unread") return notifications.filter(n => !n.read);
        return notifications.filter(n => n.type === filter);
    }, [notifications, filter]);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    // group notifications by date
    const grouped = useMemo(() => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const groups = { today: [], yesterday: [], earlier: [] };

        filteredNotifications.forEach(n => {
            const created = new Date(n.createdAt);
            if (created.toDateString() === today.toDateString()) groups.today.push(n);
            else if (created.toDateString() === yesterday.toDateString()) groups.yesterday.push(n);
            else groups.earlier.push(n);
        });

        return groups;
    }, [filteredNotifications]);

    if (loading) return <NotificationsPageSkeleton />;

    const renderGroup = (title, items) => {
        if (!items.length) return null;

        return (
            <div className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-500 uppercase">{title}</h2>

                {items.map(n => (
                    <div
                        key={n._id}
                        className={`p-4 border rounded-lg flex justify-between items-start gap-4 transition ${!n.read ? "bg-blue-50 border-blue-200" : "bg-white"
                            }`}
                    >
                        {/* LEFT: ICON + CONTENT */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="mt-1 shrink-0">
                                {getNotificationIcon(n.type)}
                            </div>

                            <div className="flex flex-col min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                    {n.title}
                                </p>

                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {n.message}
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                    {timeAgo(n.createdAt)}
                                </p>
                            </div>
                        </div>

                        {/* RIGHT: ACTIONS */}
                        <div className="flex items-center gap-3 shrink-0">
                            {!n.read && (
                                <button
                                    onClick={() => markAsRead(n._id)}
                                    className="text-blue-600 text-sm font-medium hover:text-blue-700"
                                >
                                    Mark read
                                </button>
                            )}

                            {n?.link && (
                                <Link
                                    to={n.link}
                                    className="text-blue-600 text-sm font-medium hover:text-blue-700"
                                >
                                    View
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">

            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Notifications" }
                ]}
            />

            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold flex items-center gap-2">
                    Notifications
                    {unreadCount > 0 && (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </h1>
                <button
                    onClick={markAllRead}
                    className="text-sm text-blue-600 hover:underline"
                >
                    Mark all read
                </button>
            </div>

            <div className="flex gap-3 text-sm">

                <button
                    onClick={() => setFilter("all")}
                    className={`px-3 py-1 rounded ${filter === "all" ? "bg-gray-200" : ""}`}
                >
                    All ({notifications.length})
                </button>

                <button
                    onClick={() => setFilter("unread")}
                    className={`px-3 py-1 rounded ${filter === "unread" ? "bg-gray-200" : ""}`}
                >
                    Unread ({unreadCount})
                </button>

            </div>

            <div className="space-y-6 max-w-4xl">
                {renderGroup("Today", grouped.today)}
                {renderGroup("Yesterday", grouped.yesterday)}
                {renderGroup("Earlier", grouped.earlier)}

                {!filteredNotifications.length && (
                    <div className="text-center text-gray-500 py-10">
                        No notifications found
                    </div>
                )}
            </div>
        </div>
    );
}