"use client";

import { useState } from "react";
import { Users, FileText } from "lucide-react";
import Link from "next/link";
import { API } from "@/services/api";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

type Topic = {
	_id: string;
	category_name: string;
	description?: string;
	slug?: string;
	questions: string[];
};

type AuthUser = { _id: string } | null | undefined;

type TopicCardProps = {
	topic: Topic;
	isFollowing: boolean;
	followersCount: number;
	onToggleFollow: (id: string, newState: boolean) => void;
	authUser?: AuthUser;
};

export default function TopicCard({
	topic,
	isFollowing,
	followersCount,
	onToggleFollow,
	authUser,
}: TopicCardProps) {
	const [loading, setLoading] = useState(false);

	const handleToggle = async () => {
		if (!authUser?._id) {
			toast.error("Please log in to follow topics");
			return;
		}
		try {
			setLoading(true);
			if (isFollowing) {
				await API.post(`/category/${topic._id}/unfollow`);
				toast.success("Unfollowed category");
			} else {
				await API.post(`/category/${topic._id}/follow`);
				toast.success("Followed category");
			}
			onToggleFollow(topic._id, !isFollowing);
		} catch (error) {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err.response?.data?.error || "Something went wrong.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-200">
			{/* TITLE + DESCRIPTION */}
			<div className="flex-1">
				<Link
					href={`/topic/${topic.slug}`}
					className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors"
				>
					{topic.category_name}
				</Link>

				<p
					className="mt-1 text-sm text-gray-600 leading-relaxed line-clamp-2"
					dangerouslySetInnerHTML={{ __html: topic.description || "" }}
				/>
			</div>

			{/* FOLLOW BUTTON */}
			{authUser && (
				<div className="mt-4">
					<button
						onClick={handleToggle}
						disabled={loading}
						className={`inline-flex items-center justify-center rounded-full px-5 py-1.5 
		text-xs font-semibold transition-all border cursor-pointer shadow-sm w-fit
		${
			isFollowing
				? "bg-red-50 text-red-600 border-red-300 hover:bg-red-100 hover:border-red-400"
				: "bg-purple-600 text-white hover:bg-purple-700 border-purple-600"
		}
		${loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"}
	`}
					>
						{loading ? "…" : isFollowing ? "Unfollow" : "Follow"}
					</button>
				</div>
			)}

			{/* DIVIDER */}
			<div className="h-px bg-gray-100 my-4" />

			{/* META SECTION */}
			<div className="flex items-center gap-6 text-sm text-gray-700">
				<div className="flex items-center gap-2">
					<Users className="h-4 w-4 text-gray-400" />
					<span className="font-medium">{followersCount}</span>
					<span className="text-gray-500">followers</span>
				</div>

				<div className="flex items-center gap-2">
					<FileText className="h-4 w-4 text-gray-400" />
					<span className="font-medium">{topic.questions?.length ?? 0}</span>
					<span className="text-gray-500">questions</span>
				</div>
			</div>
		</div>
	);
}
