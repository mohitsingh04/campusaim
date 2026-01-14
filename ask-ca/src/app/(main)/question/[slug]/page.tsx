"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AnswerForm from "@/components/form/AnswerForm";
import QuestionForm from "@/components/form/QuestionForm";
import { API } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import {
	Share2,
	Pencil,
	Trash,
	User,
	Eye,
	Calendar,
	Tag,
	CheckCircle2,
	Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import ProtectedButton from "@/components/common/Button/ProtectedButton";
import Swal from "sweetalert2";
import QuestionDetailsSkeleton from "@/components/common/Skeleton/QuestionDetailsSkeleton";
import { AxiosError } from "axios";
import {
	FaArrowAltCircleDown,
	FaArrowAltCircleUp,
	FaBookmark,
	FaHome,
	FaRegArrowAltCircleDown,
	FaRegArrowAltCircleUp,
	FaRegBookmark,
} from "react-icons/fa";
import Modal from "@/components/common/Modal/Modal";
import ShareModal from "@/components/modal/ShareModal";

type User = {
	_id: string;
	username?: string;
	name?: string;
};

type Category = {
	_id: string;
	category_name: string;
};

type Answer = {
	_id: string;
	author?: User;
	content: string;
	upvotes: number;
	downvotes: number;
	hasUpvoted?: boolean;
	hasDownvoted?: boolean;
	isAccepted?: boolean;
	createdAt?: string;
	updatedAt?: string;
};

type Question = {
	_id: string;
	title: string;
	author?: User;
	category: Category[]; // always array of objects
	createdAt?: string;
	updatedAt?: string;
	views?: number;
	upvotes: number;
	downvotes: number;
	hasUpvoted?: boolean;
	hasDownvoted?: boolean;
	acceptedAnswerId?: string;
	answers: Answer[];
	description: string;
	slug: string;
	answersCount: string[];
};

export default function Page() {
	const { slug } = useParams<{ slug: string }>();
	const { authUser } = useAuth();
	const router = useRouter();

	const [descExpanded, setDescExpanded] = useState(false);

	const [question, setQuestion] = useState<Question | null>(null);
	const [loading, setLoading] = useState(true);
	const [editingQuestion, setEditingQuestion] = useState(false);
	const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
	const [sortBy, setSortBy] = useState("latest");
	const [shareOpen, setShareOpen] = useState(false);

	const [followedQuestionIds, setFollowedQuestionIds] = useState<string[]>([]);
	const [followLoading, setFollowLoading] = useState(false);

	const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([]);
	const [addAnswerOpen, setAddAnswerOpen] = useState(false);

	const userId = authUser?._id;
	const isQuestionAdmin = userId === question?.author?._id;

	// Fetch question details and related questions
	const fetchData = useCallback(
		async (showLoading = true) => {
			if (!slug) return;
			try {
				if (showLoading) setLoading(true);
				const res = await API.get(
					`/questions/slug/${encodeURIComponent(slug)}/details`
				);
				const data = (res?.data?.data ?? res?.data) as Question;
				setQuestion(data);

				// Fetch related questions (multi-category safe)
				if (Array.isArray(data?.category) && data.category.length > 0) {
					const relatedRes = await API.get<{ data: Question[] }>(`/questions`);
					const allQuestions: Question[] = relatedRes.data.data || [];
					const dataCategoryIds = data.category.map((cat) => cat._id);

					const related = allQuestions
						.filter((q) => {
							if (q._id === data._id) return false;
							const qCategoryIds = Array.isArray(q.category)
								? q.category.map((cat) => cat._id)
								: [];
							return qCategoryIds.some((id) => dataCategoryIds.includes(id));
						})
						.slice(0, 5); // show top 5

					setRelatedQuestions(related);
				} else {
					setRelatedQuestions([]);
				}
			} catch (error) {
				const err = error as AxiosError<{ error: string }>;
				toast.error(
					err.response?.data?.error || "Error fetching question details."
				);
			} finally {
				if (showLoading) setLoading(false);
			}
		},
		[slug]
	);

	const fetchFollowedQuestions = useCallback(async () => {
		if (!userId) return;
		try {
			const res = await API.get<string[]>(
				`/users/${userId}/followed-questions`
			);
			setFollowedQuestionIds(res.data || []);
		} catch (error) {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err.response?.data?.error || "Something went wrong.");
		}
	}, [userId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		fetchFollowedQuestions();
	}, [fetchFollowedQuestions]);

	useEffect(() => {
		const addView = async () => {
			if (!question?._id) return;
			try {
				await API.post(`/questions/${question._id}/view`);
			} catch (err) {
				console.error("View tracking error", err);
			}
		};
		void addView();
	}, [question?._id]);

	const handleQuestionVote = async (
		qid: string,
		type: "upvote" | "downvote"
	) => {
		try {
			if (!userId) {
				toast.error("Please login to vote.");
				return;
			}

			const res = await API.post(
				`/questions/${qid}/${type}`,
				{},
				{ withCredentials: true }
			);

			// The backend should return the new upvotes, downvotes, hasUpvoted, hasDownvoted
			const { upvotes, downvotes, hasUpvoted, hasDownvoted } = res.data;

			setQuestion((prev) => {
				if (!prev) return prev;
				return { ...prev, upvotes, downvotes, hasUpvoted, hasDownvoted };
			});
		} catch (error) {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err.response?.data?.error || "Unable to process vote");
		}
	};

	const handleFollowQuestion = async (qid: string) => {
		setFollowLoading(true);
		try {
			const response = await API.post(
				`/questions/${qid}/follow`,
				{},
				{ withCredentials: true }
			);
			toast.success(response?.data?.message || "Followed Question");
			await fetchData(false);
			await fetchFollowedQuestions();
		} catch (error) {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err.response?.data?.error || "Something went wrong.");
		} finally {
			setFollowLoading(false);
		}
	};

	const handleUnfollowQuestion = async (qid: string) => {
		setFollowLoading(true);
		try {
			const response = await API.post(
				`/questions/${qid}/unfollow`,
				{},
				{ withCredentials: true }
			);
			toast.success(response?.data?.message || "Unfollowed Question");
			await fetchData(false);
			await fetchFollowedQuestions();
		} catch (error) {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err.response?.data?.error || "Something went wrong.");
		} finally {
			setFollowLoading(false);
		}
	};

	const sortedAnswers = useMemo(() => {
		const arr = [...(question?.answers ?? [])];
		const accepted = question?.acceptedAnswerId;

		const score = (x: Answer) => (x.upvotes ?? 0) - (x.downvotes ?? 0);

		const byNewest = (a: Answer, b: Answer) =>
			new Date(b.createdAt ?? 0).getTime() -
			new Date(a.createdAt ?? 0).getTime();

		const byOldest = (a: Answer, b: Answer) =>
			new Date(a.createdAt ?? 0).getTime() -
			new Date(b.createdAt ?? 0).getTime();

		const byTrending = (a: Answer, b: Answer) =>
			score(b) - score(a) || byNewest(a, b);

		const byTop = (a: Answer, b: Answer) =>
			(b.upvotes ?? 0) - (a.upvotes ?? 0) || byTrending(a, b);

		const comparator =
			sortBy === "latest"
				? byNewest
				: sortBy === "oldest"
				? byOldest
				: sortBy === "top"
				? byTop
				: byTrending;

		arr.sort((a, b) => {
			if (accepted) {
				if (a._id === accepted) return -1;
				if (b._id === accepted) return 1;
			}
			return comparator(a, b);
		});

		// Move user's answer to the top if it exists
		if (userId) {
			const idx = arr.findIndex((a) => a.author?._id === userId);
			if (idx > 0) {
				const [userAns] = arr.splice(idx, 1);
				arr.unshift(userAns);
			}
		}

		return arr;
	}, [question?.answers, question?.acceptedAnswerId, sortBy, userId]);

	const isFollowingQuestion = !!(
		question && followedQuestionIds.includes(question._id)
	);

	const handleAnswerVote = async (aid: string, type: "upvote" | "downvote") => {
		try {
			if (!userId) {
				toast.error("Please login to vote.");
				return;
			}

			const res = await API.post(
				`/answers/${aid}/${type}`,
				{},
				{ withCredentials: true }
			);

			const { upvotes, downvotes, hasUpvoted, hasDownvoted } = res.data;

			setQuestion((prev) => {
				if (!prev) return prev;

				const updatedAnswers = prev.answers.map((ans) => {
					if (ans._id !== aid) return ans;
					return { ...ans, upvotes, downvotes, hasUpvoted, hasDownvoted };
				});

				return { ...prev, answers: updatedAnswers };
			});
		} catch (error) {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err.response?.data?.error || "Unable to process vote");
		}
	};

	const handleDeleteAnswer = async (answerId: string) => {
		try {
			const result = await Swal.fire({
				title: "Are you sure?",
				text: "This action cannot be undone!",
				icon: "warning",
				showCancelButton: true,
				confirmButtonColor: "#d33",
				cancelButtonColor: "#6b7280",
				confirmButtonText: "Yes, delete it!",
				cancelButtonText: "Cancel",
			});

			if (result.isConfirmed) {
				const response = await API.delete(`/answers/${answerId}`);
				await Swal.fire(
					"Deleted!",
					response?.data?.message || "Answer has been deleted.",
					"success"
				);
				await fetchData();
			}
		} catch (error) {
			const err = error as AxiosError<{ error: string }>;
			Swal.fire(
				"Error",
				err?.response?.data?.error || "Something went wrong",
				"error"
			);
		}
	};

	const handleDeleteQuestion = async (questionId: string) => {
		try {
			const result = await Swal.fire({
				title: "Are you sure?",
				text: "This action cannot be undone!",
				icon: "warning",
				showCancelButton: true,
				confirmButtonColor: "#d33",
				cancelButtonColor: "#6b7280",
				confirmButtonText: "Yes, delete it!",
				cancelButtonText: "Cancel",
			});

			if (result.isConfirmed) {
				const response = await API.delete(`/questions/${questionId}`);

				Swal.fire(
					"Deleted!",
					response?.data?.message || "Question has been deleted.",
					"success"
				);
				router.push("/");
			}
		} catch (err: unknown) {
			if (err && typeof err === "object" && "isAxiosError" in err) {
				const axiosError = err as AxiosError<{ error?: string }>;
				Swal.fire(
					"Error",
					axiosError.response?.data?.error || "Something went wrong",
					"error"
				);
				console.error("Delete error:", axiosError);
			} else {
				Swal.fire("Error", "Something went wrong", "error");
				console.error("Delete error:", err);
			}
		}
	};

	const shareUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/question/${slug}`
			: `${process.env.NEXT_PUBLIC_BASE_URL}/question/${slug}`;

	if (loading) {
		return <QuestionDetailsSkeleton />;
	}

	if (!question) {
		return (
			<p className="py-10 text-center text-lg text-gray-600">
				Question not found.
			</p>
		);
	}

	const userAnswer = question.answers?.find((a) => a.author?._id === userId);

	return (
		<div className="mx-auto max-w-6xl px-2 sm:px-4 py-4">
			{/* Breadcrumb */}
			<nav className="flex items-center text-sm mb-6" aria-label="Breadcrumb">
				<ol className="flex items-center space-x-1 md:space-x-2 w-full">
					{/* Home */}
					<li className="inline-flex items-center">
						<Link
							href="/"
							className="inline-flex items-center text-gray-700 hover:text-purple-600"
						>
							<FaHome className="h-4 w-4 me-1" />
							Home
						</Link>
					</li>

					{/* Divider */}
					<li className="text-gray-400">/</li>

					{/* Question parent */}
					<li className="text-gray-700">
						<Link href="/question" className="hover:text-purple-600">
							<span>Questions</span>
						</Link>
					</li>

					{/* Divider */}
					<li className="text-gray-400">/</li>

					{/* Title (clamped + shrinkable) */}
					<li className="flex-1 min-w-0">
						{question && (
							<span className="block truncate line-clamp-1 font-medium text-gray-700">
								{question.title}
							</span>
						)}
					</li>
				</ol>
			</nav>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* Main content */}
				<div className="lg:col-span-12">
					{/* QUESTION CARD */}
					<section className="mb-3 rounded-xl border border-gray-200 bg-white shadow-xs transition hover:shadow-sm overflow-hidden">
						{/* Responsive: flex-col on mobile, grid-cols-[auto_1fr] on sm+ */}
						<div className="flex flex-col sm:grid sm:grid-cols-[auto_1fr]">
							{/* ------------------ DESKTOP VOTE PANEL ------------------ */}
							<div className="hidden sm:flex flex-col">
								<div className="flex flex-row sm:flex-col w-full sm:w-20 items-center justify-between sm:justify-center bg-gray-50 py-2 sm:py-6 border-b sm:border-b-0 sm:border-r border-gray-100">
									{/* Upvote */}
									<div className="flex flex-col items-center w-1/2 sm:w-full">
										<ProtectedButton
											aria-label="Upvote"
											aria-pressed={!!question.hasUpvoted}
											onClick={() =>
												void handleQuestionVote(question._id, "upvote")
											}
											className={`p-1 transition-colors cursor-pointer ${
												!!question.hasUpvoted
													? "text-emerald-600"
													: "text-gray-500 hover:text-emerald-600"
											}`}
											title={!!question.hasUpvoted ? "Remove upvote" : "Upvote"}
										>
											{!!question.hasUpvoted ? (
												<FaArrowAltCircleUp className="h-6 w-6" />
											) : (
												<FaRegArrowAltCircleUp className="h-6 w-6" />
											)}
										</ProtectedButton>

										<span className="text-lg font-semibold text-gray-800 my-1">
											{question.upvotes ?? 0}
										</span>
									</div>

									{/* Divider (desktop only) */}
									<div className="hidden sm:block my-2 h-px w-8 bg-gray-200" />

									{/* Downvote */}
									<div className="flex flex-col items-center w-1/2 sm:w-full">
										<ProtectedButton
											aria-label="Downvote"
											aria-pressed={!!question.hasDownvoted}
											onClick={() =>
												void handleQuestionVote(question._id, "downvote")
											}
											className={`p-1 transition-colors cursor-pointer ${
												!!question.hasDownvoted
													? "text-red-600"
													: "text-gray-500 hover:text-red-600"
											}`}
											title={
												!!question.hasDownvoted ? "Remove downvote" : "Downvote"
											}
										>
											{!!question.hasDownvoted ? (
												<FaArrowAltCircleDown className="h-6 w-6" />
											) : (
												<FaRegArrowAltCircleDown className="h-6 w-6" />
											)}
										</ProtectedButton>

										<span className="text-lg font-semibold text-gray-800 my-1">
											{question.downvotes ?? 0}
										</span>
									</div>
								</div>
							</div>

							{/* ------------------ MAIN CONTENT ------------------ */}
							<div className="p-4 sm:p-6">
								{/* Metadata */}
								<div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
									{question.createdAt && (
										<div className="flex items-center gap-1">
											<Calendar className="h-3.5 w-3.5" />
											<span>
												Asked{" "}
												<time
													dateTime={new Date(question.createdAt).toISOString()}
												>
													{new Date(question.createdAt).toLocaleDateString(
														"en-US",
														{
															year: "numeric",
															month: "short",
															day: "numeric",
														}
													)}
												</time>
											</span>
										</div>
									)}

									<span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700 shadow-sm">
										<Eye className="h-4 w-4 text-gray-400" />
										{question.views ?? 0} views
									</span>
								</div>

								{/* Title */}
								<h1 className="mb-3 text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight">
									{question.title}
								</h1>

								{/* Description */}
								<div className="relative">
									<div
										className={`prose text-sm text-gray-700 ${
											descExpanded ? "" : "line-clamp-3"
										}`}
										dangerouslySetInnerHTML={{ __html: question.description }}
									/>
									{question.description.length > 200 && (
										<button
											className="mt-2 text-purple-600 text-sm font-medium hover:underline focus:outline-none"
											onClick={() => setDescExpanded((v) => !v)}
										>
											{descExpanded ? "Read less" : "Read more"}
										</button>
									)}
								</div>

								{/* Categories */}
								{Array.isArray(question.category) &&
									question.category.length > 0 && (
										<div className="my-4 flex flex-wrap gap-2">
											{question.category.map((cat) => (
												<span
													key={cat._id}
													className="inline-flex items-center rounded-full bg-purple-100 px-4 py-1 text-xs font-semibold text-purple-800 ring-1 ring-purple-200 shadow-sm"
												>
													<Tag className="mr-1 h-4 w-4 text-purple-400" />
													{cat.category_name}
												</span>
											))}
										</div>
									)}

								{/* ------------------ ACTION BUTTONS ------------------ */}
								<div className="mt-6 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4 text-sm">
									<div className="flex items-center gap-2 flex-wrap">
										<button
											onClick={() => setShareOpen(true)}
											className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-gray-600 shadow-sm transition hover:bg-gray-100 hover:text-gray-900"
										>
											<Share2 className="h-4 w-4" />
											<span>Share</span>
										</button>

										{/* Follow button */}
										<ProtectedButton
											onClick={async () => {
												if (isFollowingQuestion) {
													await handleUnfollowQuestion(question._id);
												} else {
													await handleFollowQuestion(question._id);
												}
											}}
											disabled={followLoading}
											className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium shadow-sm transition ${
												isFollowingQuestion
													? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800"
													: "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
											}`}
										>
											{followLoading ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : isFollowingQuestion ? (
												<FaBookmark className="h-4 w-4 text-red-600" />
											) : (
												<FaRegBookmark className="h-4 w-4 text-gray-700" />
											)}

											<span>
												{followLoading
													? "Processing..."
													: isFollowingQuestion
													? "Unfollow"
													: "Follow"}
											</span>
										</ProtectedButton>

										{/* Admin buttons */}
										{isQuestionAdmin && (
											<>
												<button
													onClick={() => setEditingQuestion(true)}
													className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-gray-600 shadow-sm transition hover:bg-gray-100 hover:text-gray-900"
												>
													<Pencil className="h-4 w-4" />
													<span>Edit</span>
												</button>

												<button
													onClick={() =>
														void handleDeleteQuestion(question._id)
													}
													className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-gray-600 shadow-sm transition hover:bg-gray-100 hover:text-gray-900"
												>
													<Trash className="h-4 w-4" />
													<span>Delete</span>
												</button>
											</>
										)}
									</div>

									{/* Asked By */}
									<span className="ml-auto flex items-center gap-1.5 text-gray-500 order-2 w-full justify-start pt-3 sm:order-none sm:w-auto sm:pt-0">
										<User className="h-4 w-4" />
										Asked by{" "}
										<Link
											href={`/profile/${question.author?.username ?? ""}`}
											className="font-semibold text-gray-900 hover:underline"
											target="_blank"
										>
											{question.author?.name || "Anonymous"}
										</Link>
									</span>
								</div>

								{/* ------------------ MOBILE VOTE + ELLIPSIS BAR ------------------ */}
								<div className="flex sm:hidden justify-between items-center w-full mt-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
									{/* Upvote */}
									<button
										onClick={() =>
											void handleQuestionVote(question._id, "upvote")
										}
										className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition ${
											!!question.hasUpvoted
												? "text-emerald-600 bg-emerald-50 border border-emerald-200"
												: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
										}`}
									>
										{!!question.hasUpvoted ? (
											<FaArrowAltCircleUp className="h-5 w-5" />
										) : (
											<FaRegArrowAltCircleUp className="h-5 w-5" />
										)}
										<span>{question.upvotes ?? 0}</span>
									</button>

									{/* Downvote */}
									<button
										onClick={() =>
											void handleQuestionVote(question._id, "downvote")
										}
										className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition ${
											!!question.hasDownvoted
												? "text-red-600 bg-red-50 border border-red-200"
												: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
										}`}
									>
										{!!question.hasDownvoted ? (
											<FaArrowAltCircleDown className="h-5 w-5" />
										) : (
											<FaRegArrowAltCircleDown className="h-5 w-5" />
										)}
										<span>{question.downvotes ?? 0}</span>
									</button>
								</div>
							</div>
						</div>

						{/* Edit Question Modal */}
						<Modal
							open={editingQuestion}
							onClose={() => setEditingQuestion(false)}
							title="Edit Question"
						>
							<QuestionForm
								questionId={question._id}
								initialData={{
									title: question.title,
									description: question.description,
									category: Array.isArray(question.category)
										? question.category.map((cat) => cat._id)
										: [],
								}}
								onClose={() => setEditingQuestion(false)}
							/>
						</Modal>
					</section>

					{/* ANSWERS LENGTH AND SORTING */}
					{question.answers?.length > 0 ? (
						<section className="mb-3 rounded-xl border border-gray-200 bg-white shadow-xs">
							<div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
								<h2 className="text-lg font-semibold text-gray-900">
									{question.answers?.length
										? `${question.answers.length} Answer${
												question.answers.length > 1 ? "s" : ""
										  }`
										: "Answers"}
								</h2>

								<div className="flex items-center space-x-2 text-sm text-gray-700">
									<span className="font-medium">Sort by:</span>
									<select
										value={sortBy}
										onChange={(e) => setSortBy(e.target.value)}
										className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-xs focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
									>
										<option value="latest">Latest</option>
										<option value="trending">Trending</option>
										<option value="oldest">Oldest</option>
									</select>
								</div>
							</div>
						</section>
					) : null}

					{/* ADD ANSWER SECTION AS MODAL */}
					{authUser && !userAnswer && (
						<>
							<button
								onClick={() => setAddAnswerOpen(true)}
								className="rounded-xl border border-purple-600 bg-purple-50 text-purple-700 px-6 py-3 font-semibold shadow hover:bg-purple-100 transition mb-4 cursor-pointer"
							>
								Add Your Answer
							</button>
							<Modal
								open={addAnswerOpen}
								onClose={() => setAddAnswerOpen(false)}
								title="Add Your Answer"
							>
								<AnswerForm
									questionId={question._id}
									onClose={() => setAddAnswerOpen(false)}
								/>
							</Modal>
						</>
					)}

					{/* ANSWERS */}
					{sortedAnswers?.length ? (
						sortedAnswers.map((a) => {
							const isAccepted =
								question?.acceptedAnswerId === a._id || a.isAccepted;
							const isUserAnswer = a.author?._id === userId;

							return (
								<section
									key={a._id}
									className={`rounded-xl border border-gray-200 bg-white shadow-xs mb-4 ${
										isUserAnswer ? "ring-2 ring-purple-200 bg-purple-50" : ""
									}`}
								>
									<article
										className={`border-b px-6 py-6 last:border-b-0 ${
											isAccepted
												? "border-l-4 border-green-400 bg-green-50"
												: ""
										}`}
									>
										<div className="px-6 py-6 border-b last:border-b-0">
											{/* Accepted or Your Answer badges */}
											<div className="flex items-center gap-2 mb-2">
												{isUserAnswer && (
													<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-semibold">
														Your Answer
													</span>
												)}
												{isAccepted && (
													<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">
														<CheckCircle2 className="w-4 h-4" />
														Accepted
													</span>
												)}
											</div>

											{/* Answer Content */}
											<span
												className="prose text-sm text-gray-700"
												dangerouslySetInnerHTML={{ __html: a.content }}
											/>

											{/* Answered By + Edit/Delete */}
											<div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-700">
												<span>
													Answered by{" "}
													<Link
														href={`/profile/${a.author?.username ?? ""}`}
														className="hover:underline"
														target="_blank"
													>
														<span className="font-medium text-gray-900">
															{a.author?.name || "Anonymous"}
														</span>
													</Link>
												</span>

												{isUserAnswer && (
													<>
														<button
															onClick={() => setEditingAnswerId(a._id)}
															className="font-medium text-purple-600 hover:underline"
														>
															Edit Answer
														</button>
														<button
															onClick={() => void handleDeleteAnswer(a._id)}
															className="font-medium text-purple-600 hover:underline"
														>
															Delete Answer
														</button>
													</>
												)}
											</div>

											{/* Metadata */}
											<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
												{a.createdAt && (
													<div className="flex items-center gap-1">
														<Calendar className="h-3 w-3" />
														<span>
															Answered{" "}
															<time
																dateTime={new Date(a.createdAt).toISOString()}
															>
																{new Date(a.createdAt).toLocaleDateString(
																	"en-US",
																	{
																		year: "numeric",
																		month: "short",
																		day: "numeric",
																	}
																)}
															</time>
														</span>
													</div>
												)}
											</div>

											{/* ANSWER VOTE BAR (Beautiful Quora-style) */}
											<div className="mt-4 w-full flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
												{/* Upvote Button */}
												<button
													onClick={() => void handleAnswerVote(a._id, "upvote")}
													className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition ${
														a.hasUpvoted
															? "text-purple-600 bg-purple-50 border-purple-200"
															: "text-gray-700 bg-white border-gray-300 hover:bg-gray-100"
													}`}
												>
													{a.hasUpvoted ? (
														<FaArrowAltCircleUp className="h-5 w-5" />
													) : (
														<FaRegArrowAltCircleUp className="h-5 w-5" />
													)}
													<span className="font-medium">
														Upvote • {a.upvotes ?? 0}
													</span>
												</button>

												{/* Divider */}
												<div className="h-6 w-px bg-gray-300"></div>

												{/* Downvote Button */}
												<button
													onClick={() =>
														void handleAnswerVote(a._id, "downvote")
													}
													className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition ${
														a.hasDownvoted
															? "text-red-600 bg-red-50 border-red-200"
															: "text-gray-700 bg-white border-gray-300 hover:bg-gray-100"
													}`}
												>
													{a.hasDownvoted ? (
														<FaArrowAltCircleDown className="h-5 w-5" />
													) : (
														<FaRegArrowAltCircleDown className="h-5 w-5" />
													)}
													<span className="font-medium">
														{a.downvotes ?? 0}
													</span>
												</button>
											</div>

											{/* Edit Answer Modal */}
											<Modal
												open={editingAnswerId === a._id}
												onClose={() => setEditingAnswerId(null)}
												title="Edit Answer"
											>
												<AnswerForm
													answerId={a._id}
													initialData={a}
													isEditing
													onClose={() => setEditingAnswerId(null)}
												/>
											</Modal>
										</div>
									</article>
								</section>
							);
						})
					) : (
						<div className="mb-3 rounded-xl border border-gray-200 bg-white  shadow-xs">
							<p className="py-6 text-center text-gray-500">
								No answers yet — be the first to contribute.
							</p>
						</div>
					)}

					{/* Share Modal */}
					<ShareModal
						open={shareOpen}
						onClose={() => setShareOpen(false)}
						url={shareUrl}
						title={question.title}
					/>
				</div>

				{/* Related Questions Sidebar */}
				<aside className="lg:col-span-12 mt-8 lg:mt-0">
					<section className="bg-white border border-gray-100 rounded-xl shadow-sm">
						<h3 className="border-b border-gray-100 px-5 py-3 text-sm font-semibold text-gray-800">
							Related Questions
						</h3>

						<ul className="divide-y divide-gray-100">
							{relatedQuestions.length === 0 ? (
								<li className="p-5 text-gray-500 text-sm text-center">
									No related questions found.
								</li>
							) : (
								relatedQuestions.map((q) => (
									<li
										key={q._id}
										className="group p-5 transition-all hover:bg-gray-50 cursor-pointer"
									>
										<Link
											href={`/question/${q.slug}`}
											className="flex items-start gap-3"
										>
											{/* Left indicator */}
											<div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-purple-500 opacity-70 group-hover:opacity-100"></div>

											{/* Content */}
											<div className="flex-1">
												<p className="font-medium text-gray-900 group-hover:text-purple-700 leading-snug">
													{q.title}
												</p>

												<div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
													<span>{q.answersCount ?? 0} answers</span>
													<span>·</span>
													<span>{q.views ?? 0} views</span>

													{q.createdAt && (
														<>
															<span>·</span>
															<span className="flex items-center gap-1">
																<Calendar className="h-3 w-3 text-gray-400" />
																<time
																	dateTime={new Date(q.createdAt).toISOString()}
																>
																	{new Date(q.createdAt).toLocaleDateString(
																		"en-US",
																		{
																			year: "numeric",
																			month: "short",
																			day: "numeric",
																		}
																	)}
																</time>
															</span>
														</>
													)}
												</div>
											</div>
										</Link>
									</li>
								))
							)}
						</ul>
					</section>
				</aside>
			</div>
		</div>
	);
}
