"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API } from "@/services/api";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

type NotificationsProps = {
	onClose?: () => void;
};

type Notification = {
	_id: string;
	type: string;
	sender?: {
		username: string;
		name: string;
	};
	question?: {
		slug: string;
		title: string;
	};
	category?: {
		slug: string;
		category_name: string;
	};
	createdAt: string;
};

export default function Notifications({ onClose }: NotificationsProps) {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const res = await API.get("/notifications");
				setNotifications(res.data as Notification[]);
			} catch (error) {
				const err = error as AxiosError<{ error: string }>;
				toast.error(err.response?.data?.error || "Something went wrong.");
			} finally {
				setLoading(false);
			}
		};
		fetchNotifications();
	}, []);

	if (loading)
		return <div className="p-4 text-sm text-gray-500">Loading...</div>;

	if (notifications.length === 0)
		return (
			<div className="p-4 text-sm text-gray-500">No new notifications</div>
		);

	const visibleNotifications = notifications.slice(0, 10);

	return (
		<div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
			{visibleNotifications.map((n) => (
				<div key={n._id} className="p-3 hover:bg-gray-50">
					{n.type === "USER_FOLLOWED" ? (
						<p className="text-sm text-gray-800">
							<strong>
								<Link
									href={`/profile/${n.sender?.username}`}
									className="hover:underline"
									target="blank"
								>
									{n.sender?.name}
								</Link>
							</strong>{" "}
							started following you.
						</p>
					) : n.type === "NEW_ANSWER" ? (
						<p className="text-sm text-gray-800">
							<strong>
								<Link
									href={`/profile/${n.sender?.username}`}
									className="hover:underline"
									target="blank"
								>
									{n.sender?.name}
								</Link>
							</strong>{" "}
							added an answer to{" "}
							<Link
								href={`/question/${n.question?.slug}`}
								className="text-blue-600 hover:underline"
								target="blank"
							>
								{n.question?.title}
							</Link>
						</p>
					) : n.type === "USER_ASKED_QUESTION" ? (
						<p className="text-sm text-gray-800">
							<strong>
								<Link
									href={`/profile/${n.sender?.username}`}
									className="hover:underline"
									target="blank"
								>
									{n.sender?.name}
								</Link>
							</strong>{" "}
							asked a new question:{" "}
							<Link
								href={`/question/${n.question?.slug}`}
								className="text-blue-600 hover:underline"
								target="blank"
							>
								{n.question?.title}
							</Link>
						</p>
					) : n.type === "TOPIC_NEW_QUESTION" ? (
						<p className="text-sm text-gray-800">
							<strong>
								<Link
									href={`/profile/${n.sender?.username}`}
									className="hover:underline"
									target="blank"
								>
									{n.sender?.name}
								</Link>
							</strong>{" "}
							asked a new question in topic:{" "}
							<Link
								href={`/topic/${n.category?.slug}`}
								className="text-blue-600 hover:underline"
								target="blank"
							>
								{n.category?.category_name}
							</Link>
						</p>
					) : (
						<p className="text-sm text-gray-800">
							You have a new notification.
						</p>
					)}
					<span className="block text-xs text-gray-400 mt-1">
						{n.createdAt
							? formatDistanceToNow(new Date(n.createdAt), {
									addSuffix: true,
							  })
							: "just now"}
					</span>
				</div>
			))}
			{notifications.length > 10 && (
				<div className="p-3 text-center">
					<Link
						href="/notifications"
						className="text-blue-600 font-medium hover:underline"
						onClick={() => {
							if (onClose) onClose();
						}}
					>
						View all notifications
					</Link>
				</div>
			)}
		</div>
	);
}
