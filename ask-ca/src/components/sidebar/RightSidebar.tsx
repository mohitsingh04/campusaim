"use client";

import { API } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users } from "lucide-react";
import type { TopUser, TrendingQuestions } from "@/config/Types";
import Link from "next/link";
import Image from "next/image";

const ListItemSkeleton = () => (
	<div className="flex items-center gap-3 animate-pulse">
		<div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0"></div>
		<div className="flex-1 space-y-2">
			<div className="h-4 bg-slate-200 rounded w-3/4"></div>
			<div className="h-3 bg-slate-200 rounded w-1/2"></div>
		</div>
	</div>
);

export default function RightSidebar() {
	const {
		data: topUsers,
		isLoading: isUsersLoading,
		isError: isUsersError,
	} = useQuery<TopUser[]>({
		queryKey: ["topUsers"],
		queryFn: () => API.get(`/top-users`).then((res) => res.data || []),
	});

	const {
		data: trendingQuestions,
		isLoading: isQuestionsLoading,
		isError: isQuestionsError,
	} = useQuery<TrendingQuestions[]>({
		queryKey: ["trendingQuestions"],
		queryFn: () => API.get(`/trending-questions`).then((res) => res.data || []),
	});

	return (
		<div className="sticky top-24 space-y-6">
			{/* --- Trending Questions Card --- */}
			<div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
				<div className="flex items-center gap-2 mb-4">
					<TrendingUp className="w-5 h-5 text-orange-500" />
					<h3 className="font-semibold text-slate-900">Trending Questions</h3>
				</div>
				<div className="space-y-4">
					{isQuestionsLoading && (
						<>
							<ListItemSkeleton />
							<ListItemSkeleton />
							<ListItemSkeleton />
						</>
					)}

					{isQuestionsError && (
						<p className="text-sm text-red-500">Could not load questions.</p>
					)}

					{!isQuestionsLoading && !isQuestionsError && (
						<>
							{trendingQuestions && trendingQuestions.length > 0 ? (
								trendingQuestions.map((question, index) => (
									<Link
										href={`/question/${question.slug}`}
										key={question._id}
										className="group block"
										target="blank"
									>
										<div className="flex gap-3">
											<span className="text-sm font-semibold text-slate-400 min-w-[20px]">
												{index + 1}
											</span>
											<div className="flex-1">
												<p className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors leading-snug mb-1">
													{question.title}
												</p>
												<span className="text-xs text-slate-500">
													{question.upvotes} votes
												</span>
											</div>
										</div>
									</Link>
								))
							) : (
								<p className="text-sm text-slate-500">
									No trending questions right now.
								</p>
							)}
						</>
					)}
				</div>
			</div>

			{/* --- Top Contributors Card --- */}
			<div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
				<div className="flex items-center gap-2 mb-4">
					<Users className="w-5 h-5 text-blue-500" />
					<h3 className="font-semibold text-slate-900">Top Contributors</h3>
				</div>
				<div className="space-y-4">
					{isUsersLoading && (
						<>
							<ListItemSkeleton />
							<ListItemSkeleton />
							<ListItemSkeleton />
						</>
					)}

					{isUsersError && (
						<p className="text-sm text-red-500">Could not load contributors.</p>
					)}

					{!isUsersLoading && !isUsersError && (
						<>
							{topUsers && topUsers.length > 0 ? (
								topUsers.map(({ user, score }) => (
									<Link
										key={user?._id}
										href={`/profile/${user.username}`}
										className="flex items-center gap-3 group"
										target="_blank"
										rel="noopener noreferrer"
									>
										{user.avatar?.[0] ? (
											<Image
												src={
													user.avatar[0].startsWith("http")
														? user.avatar[0]
														: `${process.env.NEXT_PUBLIC_MEDIA_URL}/${user.avatar[0]}`
												}
												alt={user.name || "User"}
												width={40}
												height={40}
												className="w-10 h-10 rounded-full object-cover"
											/>
										) : (
											<span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-base font-bold text-gray-700">
												{user.name?.[0]?.toUpperCase() || "U"}
											</span>
										)}
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors truncate">
												{user.name}
											</p>
											<div className="flex items-center gap-2 text-xs text-slate-500">
												<span>@{user.username}</span>
												<span aria-hidden="true">•</span>
												<span>{score} rep</span>
											</div>
										</div>
									</Link>
								))
							) : (
								<p className="text-sm text-slate-500">
									No top contributors yet.
								</p>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
