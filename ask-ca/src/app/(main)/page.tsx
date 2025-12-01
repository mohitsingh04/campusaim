"use client";
import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import QuestionCard from "@/components/cards/QuestionCard";
import { useQuestionsData } from "@/components/hooks/useQuestionsData";

export default function QuestionList() {
	const { authUser } = useAuth();
	const [sortBy, setSortBy] = useState("latest");
	const [visibleCount, setVisibleCount] = useState(10);

	const {
		loading,
		questions,
		getAuthorById,
		getAnswersByQuestionId,
		handleVote,
		handleDelete,
		handleFollow,
		handleUnfollow,
		handleShare,
		handleCopyLink,
		followedQuestionIds,
	} = useQuestionsData();

	const sortedQuestions = useMemo(() => {
		const qs = [...questions];
		switch (sortBy) {
			case "latest":
				return qs.sort(
					(a, b) =>
						new Date(b.createdAt ?? 0).getTime() -
						new Date(a.createdAt ?? 0).getTime()
				);
			case "oldest":
				return qs.sort(
					(a, b) =>
						new Date(a.createdAt ?? 0).getTime() -
						new Date(b.createdAt ?? 0).getTime()
				);
			case "mostAnswered":
				return qs.sort(
					(a, b) =>
						getAnswersByQuestionId(b._id).length -
						getAnswersByQuestionId(a._id).length
				);
			case "leastAnswered":
				return qs.sort(
					(a, b) =>
						getAnswersByQuestionId(a._id).length -
						getAnswersByQuestionId(b._id).length
				);
			case "trending":
			default:
				return qs.sort((a, b) => {
					const scoreA = (a.upvotes ?? 0) - (a.downvotes ?? 0);
					const scoreB = (b.upvotes ?? 0) - (b.downvotes ?? 0);
					return scoreB - scoreA;
				});
		}
	}, [questions, sortBy, getAnswersByQuestionId]);

	const visibleQuestions = sortedQuestions.slice(0, visibleCount);

	return (
		<>
			<div className="mx-auto max-w-6xl px-2 sm:px-4 py-4">
				{/* Main grid */}
				<div className="flex flex-col md:flex-row gap-6">
					{/* Main content (8/12) */}
					<div className="w-full md:w-12/12">
						<div className="mb-6 border-b border-gray-200 pb-4">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
								{/* Title */}
								<h2 className="text-xl font-bold text-gray-900 tracking-tight">
									{sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} Questions
								</h2>

								{/* Sort Dropdown */}
								<div className="flex items-center gap-3">
									<span className="text-sm font-medium text-gray-600">
										Sort by
									</span>

									<div className="relative">
										<select
											value={sortBy}
											onChange={(e) => setSortBy(e.target.value)}
											className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 pr-10 cursor-pointer"
										>
											<option value="latest">Latest</option>
											<option value="trending">Trending</option>
											<option value="oldest">Oldest</option>
											<option value="mostAnswered">Most Answered</option>
											<option value="leastAnswered">Least Answered</option>
										</select>

										{/* Dropdown Icon */}
										<span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
											▼
										</span>
									</div>
								</div>
							</div>
						</div>

						{loading && (
							<div className="space-y-4">
								{Array.from({ length: 3 }).map((_, i) => (
									<div
										key={i}
										className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
									>
										<div className="flex items-center gap-3">
											<div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
											<div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
										</div>
										<div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-gray-200" />
										<div className="mt-2 h-4 w-full animate-pulse rounded bg-gray-200" />
										<div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-gray-200" />
									</div>
								))}
							</div>
						)}
						{!loading && sortedQuestions.length > 0 && (
							<div className="w-full space-y-4">
								{visibleQuestions.map((q) => {
									const author = getAuthorById(
										typeof q.author === "string" ? q.author : q.author?._id
									);
									const answersCount = getAnswersByQuestionId(q._id).length;
									const userId = authUser?._id;
									const isFollowing = !!followedQuestionIds.includes(q._id);

									return (
										<QuestionCard
											key={q._id}
											question={q}
											author={author}
											answersCount={answersCount}
											onUpvote={() => handleVote(q._id, "upvote")}
											onDownvote={() => handleVote(q._id, "downvote")}
											onFollow={() => handleFollow(q._id)}
											onUnfollow={() => handleUnfollow(q._id)}
											onDelete={() => handleDelete(q._id)}
											onShare={() => handleShare(q)}
											onCopyLink={() => handleCopyLink(q)}
											isFollowing={isFollowing}
											hasUpvoted={!!q.hasUpvoted}
											hasDownvoted={!!q.hasDownvoted}
											authUserId={userId}
										/>
									);
								})}
								{visibleCount < sortedQuestions.length && (
									<div className="flex justify-center py-4">
										<button
											className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition cursor-pointer"
											onClick={() =>
												setVisibleCount((prev) =>
													Math.min(prev + 10, sortedQuestions.length)
												)
											}
										>
											Load more
										</button>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
