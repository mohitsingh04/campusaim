"use client";

import Link from "next/link";
import { API } from "@/services/api";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import NotificationsSkeleton from "@/components/common/Skeleton/NotificationsSkeleton";
import { useQuery } from "@tanstack/react-query";

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
	isRead?: boolean;
};

export default function Notifications() {
	const {
		data: notifications = [],
		isLoading,
		isError,
		error,
	} = useQuery<Notification[], AxiosError>({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const res = await API.get("/notifications");
				return res.data as Notification[];
			} catch (error) {
				const err = error as AxiosError<{ error: string }>;
				toast.error(err.response?.data?.error || "Something went wrong.");
				throw err;
			}
		},
	});

	if (isLoading) {
		return <NotificationsSkeleton />;
	}

	if (isError) {
		let errorMessage = "Failed to load notifications.";
		const axiosError = error as AxiosError<{ error?: string }>;
		if (axiosError?.response?.data?.error) {
			errorMessage = axiosError.response.data.error;
		}
		return (
			<div className="max-w-2xl py-8 px-2 sm:px-0">
				<h1 className="text-2xl font-bold mb-6 text-gray-900">Notifications</h1>
				<div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-sm text-red-500">
					{errorMessage}
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-2xl py-8 px-2 sm:px-0">
			<h1 className="text-2xl font-bold mb-6 text-gray-900">Notifications</h1>
			<div className="bg-white border border-gray-200 rounded-xl shadow-sm">
				{notifications.length === 0 ? (
					<div className="p-6 text-sm text-gray-500">No new notifications</div>
				) : (
					<ul className="divide-y divide-gray-100">
						{notifications.map((n) => (
							<li
								key={n._id}
								className={`p-4 hover:bg-gray-50 transition ${
									!n.isRead ? "bg-blue-50/50" : ""
								}`}
							>
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
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}