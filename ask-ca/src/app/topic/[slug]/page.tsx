"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import QuestionCard from "@/components/cards/QuestionCard";
import Link from "next/link";
import { Users, FileText } from "lucide-react";
import { useQuestionsData } from "@/components/hooks/useQuestionsData";
import TopicViewSkeleton from "@/components/common/Skeleton/TopicViewSkeleton";

export default function TopicDetails() {
	const params = useParams<{ slug: string }>();
	const slug = params?.slug;
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
		categoryData,
		followedQuestionIds,
	} = useQuestionsData({ slug });

	// ---------------- SORTING ----------------
	const sortedQuestions = useMemo(() => {
		const qs = [...questions];

		switch (sortBy) {
			case "newest":
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

	// ---------------- LOADING ----------------
	if (loading) return <TopicViewSkeleton />;

	// ---------------- UI ----------------
	return (
		<div className="mx-auto max-w-6xl px-2 sm:px-4 py-4">
			{/* ---------------- TOPIC HEADER ---------------- */}
			{categoryData && (
				<div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all">
					{/* Title */}
					<div className="mb-3">
						<Link
							href={`/topic/${categoryData.slug}`}
							className="text-lg sm:text-xl font-bold text-gray-900 hover:text-blue-600"
						>
							{categoryData.category_name}
						</Link>

						<p
							className="mt-1 line-clamp-2 text-sm text-gray-600"
							dangerouslySetInnerHTML={{
								__html: categoryData.description || "",
							}}
						/>
					</div>

					{/* Stats */}
					<div className="flex flex-wrap gap-4 text-sm text-gray-500">
						<div className="flex items-center gap-1">
							<Users className="h-4 w-4 text-gray-400" />
							{categoryData.followers?.length ?? 0} followers
						</div>

						<div className="flex items-center gap-1">
							<FileText className="h-4 w-4 text-gray-400" />
							{questions.length} questions
						</div>
					</div>
				</div>
			)}

			{/* ---------------- SORTING CONTROL ---------------- */}
			<div className="my-6 border-b border-gray-200 pb-4">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<h2 className="text-xl font-bold text-gray-900 tracking-tight">
						{sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} Questions
					</h2>

					<div className="flex items-center gap-3">
						<span className="text-sm font-medium text-gray-600">Sort by</span>

						<div className="relative">
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
								className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-300 cursor-pointer pr-10"
							>
								<option value="latest">Latest</option>
								<option value="trending">Trending</option>
								<option value="oldest">Oldest</option>
								<option value="mostAnswered">Most Answered</option>
								<option value="leastAnswered">Least Answered</option>
							</select>

							<span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
								▼
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* ---------------- QUESTION LIST ---------------- */}
			<div className="space-y-4">
				{visibleQuestions.map((q) => {
					const author = getAuthorById(
						typeof q.author === "string" ? q.author : q.author?._id
					);
					const answersCount = getAnswersByQuestionId(q._id).length;
					const userId = authUser?._id;

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
							isFollowing={!!followedQuestionIds.includes(q._id)}
							hasUpvoted={!!q.hasUpvoted}
							hasDownvoted={!!q.hasDownvoted}
							authUserId={userId}
						/>
					);
				})}

				{visibleCount < sortedQuestions.length && (
					<div className="flex justify-center pt-4">
						<button
							className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition cursor-pointer"
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

			{/* ---------------- EMPTY STATE ---------------- */}
			{sortedQuestions.length === 0 && (
				<div className="flex flex-col items-center justify-center py-16">
					<div className="text-4xl mb-2">🧐</div>
					<div className="text-lg font-semibold text-gray-700 mb-1">
						No questions found
					</div>
					<div className="text-gray-500 text-sm">
						Try a different topic or check back later.
					</div>
				</div>
			)}
		</div>
	);
}
