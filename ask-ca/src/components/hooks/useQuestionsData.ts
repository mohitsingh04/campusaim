"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/services/api";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import type { User, Category, Answer, Question, TopUser } from "@/config/Types";
import { AxiosError } from "axios";

// Helper for unwrapping API responses
function unwrapArray<T>(res: { data?: T[] | { data?: T[] } }): T[] {
	const d = res?.data;
	if (Array.isArray(d)) return d as T[];
	if (Array.isArray((d as { data?: T[] })?.data))
		return (d as { data?: T[] }).data as T[];
	return [];
}

export function useQuestionsData({
	categoryId,
	slug,
}: { categoryId?: string; slug?: string } = {}) {
	const { authUser } = useAuth();
	const queryClient = useQueryClient();

	// Fetch category data if slug is provided
	const { data: categoryData } = useQuery({
		queryKey: ["categoryData", slug],
		queryFn: () =>
			slug ? API(`/category/${slug}/details`).then((res) => res.data) : null,
		enabled: !!slug,
	});

	// Fetch all questions
	const { data: allQuestions = [], isLoading: loadingQuestions } = useQuery({
		queryKey: ["questions"],
		queryFn: () => API(`/questions`).then(unwrapArray<Question>),
	});

	// Fetch authors
	const { data: authors = [] } = useQuery({
		queryKey: ["authors"],
		queryFn: () => API(`/users`).then(unwrapArray<User>),
	});

	// Fetch categories
	const { data: categories = [] } = useQuery({
		queryKey: ["categories"],
		queryFn: () => API(`/category`).then(unwrapArray<Category>),
	});

	// Fetch answers
	const { data: answers = [] } = useQuery({
		queryKey: ["answers"],
		queryFn: () => API(`/answers`).then(unwrapArray<Answer>),
	});

	// Fetch top-users
	const { data: topUsers = [] } = useQuery({
		queryKey: ["topUsers"],
		queryFn: () => API(`/top-users`).then(unwrapArray<TopUser>),
	});

	// Fetch followed questions for the current user
	const { data: followedQuestionIds = [] } = useQuery({
		queryKey: ["followedQuestions", authUser?._id],
		queryFn: () =>
			authUser?._id
				? API.get<string[]>(`/users/${authUser._id}/followed-questions`).then(
						(res) => res.data || []
				  )
				: [],
		enabled: !!authUser?._id,
	});

	// Filter questions based on category
	let filteredQuestions = allQuestions;
	if (categoryData) {
		filteredQuestions = allQuestions.filter((q) =>
			Array.isArray(q.category)
				? q.category.some((cat: Category) => cat._id === categoryData._id)
				: false
		);
	} else if (categoryId) {
		filteredQuestions = allQuestions.filter((q) =>
			Array.isArray(q.category)
				? q.category.some((cat: Category) => cat._id === categoryId)
				: false
		);
	}

	// Mutations
	const voteMutation = useMutation({
		mutationFn: ({
			questionId,
			type,
		}: {
			questionId: string;
			type: "upvote" | "downvote";
		}) =>
			API.post(
				`/questions/${questionId}/${type}`,
				{},
				{ withCredentials: true }
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["questions"] });
			toast.success("Vote updated!");
		},
		onError: (error: unknown) => {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err?.response?.data?.error || "Something went wrong.");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (questionId: string) => {
			const Swal = (await import("sweetalert2")).default;
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
				return API.delete(`/questions/${questionId}`);
			}
			throw new Error("Cancelled");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["questions"] });
			toast.success("Question deleted!");
		},
		onError: (error: unknown) => {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err?.response?.data?.error || "Something went wrong.");
		},
	});

	const followMutation = useMutation({
		mutationFn: (questionId: string) =>
			API.post(
				`/questions/${questionId}/follow`,
				{},
				{ withCredentials: true }
			),
		onSuccess: () => {
			toast.success("Followed Question");
			queryClient.invalidateQueries({ queryKey: ["questions"] });
			queryClient.invalidateQueries({
				queryKey: ["followedQuestions", authUser?._id],
			});
		},
		onError: (error: unknown) => {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err?.response?.data?.error || "Something went wrong.");
		},
	});

	const unfollowMutation = useMutation({
		mutationFn: (questionId: string) =>
			API.post(
				`/questions/${questionId}/unfollow`,
				{},
				{ withCredentials: true }
			),
		onSuccess: () => {
			toast.success("Unfollowed Question");
			queryClient.invalidateQueries({ queryKey: ["questions"] });
			queryClient.invalidateQueries({
				queryKey: ["followedQuestions", authUser?._id],
			});
		},
		onError: (error: unknown) => {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err?.response?.data?.error || "Something went wrong.");
		},
	});

	// Helper functions
	const getAuthorById = (_id?: string): User | undefined =>
		authors.find((a) => a._id === _id);
	const getCategoryById = (_id?: string): string =>
		categories.find((c) => c._id === _id)?.category_name || "Uncategorized";
	const getAnswersByQuestionId = (_id: string): Answer[] =>
		Array.isArray(answers) ? answers.filter((a) => a.question === _id) : [];

	// Share and copy link remain the same
	const handleShare = async (q: Question) => {
		try {
			const origin =
				typeof window !== "undefined"
					? window.location.origin
					: process.env.NEXT_PUBLIC_BASE_URL || "";

			const url = `${origin}/question/${q.slug}`;

			const nav = navigator as Navigator & {
				share?: (data: {
					title?: string;
					text?: string;
					url?: string;
				}) => Promise<void>;
			};

			if (nav.share) {
				await nav.share({ title: q.title, url });
			} else {
				await navigator.clipboard.writeText(url);
				toast.success("Link copied to clipboard");
			}
		} catch {
			toast.error("Could not share link");
		}
	};

	const handleCopyLink = async (q: Question) => {
		try {
			const origin =
				typeof window !== "undefined"
					? window.location.origin
					: process.env.NEXT_PUBLIC_BASE_URL || "";

			const url = `${origin}/question/${q.slug}`;

			await navigator.clipboard.writeText(url);
			toast.success("Link copied to clipboard!");
		} catch {
			toast.error("Could not copy link");
		}
	};

	return {
		loading: loadingQuestions,
		questions: filteredQuestions,
		authors,
		categories,
		answers,
		categoryData,
		topUsers,
		getAuthorById,
		getCategoryById,
		getAnswersByQuestionId,
		handleVote: (questionId: string, type: "upvote" | "downvote") =>
			voteMutation.mutate({ questionId, type }),
		handleDelete: (questionId: string) => deleteMutation.mutate(questionId),
		handleFollow: (questionId: string) => followMutation.mutate(questionId),
		handleUnfollow: (questionId: string) => unfollowMutation.mutate(questionId),
		handleShare,
		handleCopyLink,
		followedQuestionIds,
	};
}
