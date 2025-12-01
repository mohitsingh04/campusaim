"use client";

import React, { useMemo, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { API } from "@/services/api";
import { useParams } from "next/navigation";
import ProfileTab from "@/components/profileTabs/ProfileTab";
import AnswerTab from "@/components/profileTabs/AnswerTab";
import QuestionTab from "@/components/profileTabs/QuestionTab";
import FollowersTab from "@/components/profileTabs/FollowersTab";
import FollowingTab from "@/components/profileTabs/FollowingTab";
import TopicsTab from "@/components/profileTabs/TopicsTab";
import ProfileSkeleton from "@/components/common/Skeleton/ProfileSkeleton";
import Link from "next/link";
import Image from "next/image";
import FollowedQuestion from "@/components/profileTabs/FollowedQuestion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import ProtectedButton from "@/components/common/Button/ProtectedButton";

// ---------- Types ----------
interface User {
	_id: string;
	name: string;
	username: string;
	createdAt?: string;
	avatar?: string[];
	isGoogleLogin?: string[];
}

interface Question {
	_id: string;
	title: string;
	author: { _id: string };
	slug: string;
}

interface Answer {
	_id: string;
	author: string;
	question: string;
	updatedAt?: string;
}

interface Topic {
	_id: string;
	category_name: string;
	parent_category?: string;
	description?: string;
	slug?: string;
	questions: string[];
}

interface Reputation {
	score: number;
}

// ------- helpers ----------
const formatDate = (iso?: string) => {
	if (!iso) return "-";
	try {
		return new Intl.DateTimeFormat(undefined, {
			year: "numeric",
			month: "short",
			day: "2-digit",
		}).format(new Date(iso));
	} catch {
		return "-";
	}
};

const getInitials = (name = "") =>
	name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((n) => n[0]?.toUpperCase())
		.join("") || "U";

export default function Profile() {
	const params = useParams();
	const username = params?.username as string;
	const { authUser } = useAuth();
	const queryClient = useQueryClient();

	// UI + state
	const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const [selected, setSelected] = useState(0);
	const [followLoading, setFollowLoading] = useState(false);

	// Fetch user profile
	const {
		data: user,
		isLoading: isLoadingUser,
		isError: isNotFound,
	} = useQuery<User, AxiosError>({
		queryKey: ["user", username],
		queryFn: async () => {
			const res = await API.get<User | null>(`/user/${username}`);
			if (!res.data || Object.keys(res.data).length === 0) {
				throw new Error("User not found");
			}
			return res.data;
		},
	});

	// Fetch all questions
	const { data: allQuestions = [] } = useQuery<Question[]>({
		queryKey: ["questions"],
		queryFn: async () => {
			const res = await API.get<{ data: Question[] }>("/questions");
			return res.data.data || [];
		},
	});

	// Fetch all answers
	const { data: allAnswers = [] } = useQuery<Answer[]>({
		queryKey: ["answers"],
		queryFn: async () => {
			const res = await API.get<Answer[]>("/answers");
			return res.data || [];
		},
	});

	// Fetch all topics
	const { data: allTopics = [] } = useQuery<Topic[]>({
		queryKey: ["topics"],
		queryFn: async () => {
			const res = await API.get<Topic[]>("/categories");
			return (res.data || []).filter((a) => a.parent_category === "Ask");
		},
	});

	// Filtered data for this user
	const questionList = useMemo(
		() => allQuestions.filter((q) => q.author?._id === user?._id),
		[allQuestions, user?._id]
	);
	const answerList = useMemo(
		() => allAnswers.filter((a) => a.author === user?._id),
		[allAnswers, user?._id]
	);

	// Fetch followed topic IDs for the user
	const { data: followedTopicIds = [] } = useQuery<string[]>({
		queryKey: ["followedTopicIds", user?._id],
		queryFn: async () => {
			if (!user?._id) return [];
			const res = await API.get(`/category/${user._id}/categories`);
			return Array.isArray(res.data)
				? res.data.map((cat: Topic) => cat._id)
				: [];
		},
		enabled: !!user?._id,
	});

	// Fetch followers count for topics
	const { data: followersCounts = {} } = useQuery<Record<string, number>>({
		queryKey: ["followersCounts", followedTopicIds.join(",")],
		queryFn: async () => {
			const counts: Record<string, number> = {};
			await Promise.all(
				allTopics
					.filter((t) => followedTopicIds.includes(t._id))
					.map(async (topic) => {
						try {
							const res = await API.get(`/category/${topic._id}/followers`);
							counts[topic._id] = Array.isArray(res.data) ? res.data.length : 0;
						} catch {
							counts[topic._id] = 0;
						}
					})
			);
			return counts;
		},
		enabled: !!user?._id && followedTopicIds.length > 0,
	});

	// Fetch followed question IDs for the user
	const { data: followedQuestionIds = [] } = useQuery<string[]>({
		queryKey: ["followedQuestionIds", user?._id],
		queryFn: async () => {
			if (!user?._id) return [];
			const res = await API.get<string[]>(
				`/users/${user._id}/followed-questions`
			);
			return res.data || [];
		},
		enabled: !!user?._id,
	});

	// Set followedQuestions based on followedQuestionIds and allQuestions
	const followedQuestions = useMemo(
		() => allQuestions.filter((q) => followedQuestionIds.includes(q._id)),
		[allQuestions, followedQuestionIds]
	);

	// Fetch reputation
	const { data: reputation } = useQuery<Reputation | null>({
		queryKey: ["reputation", user?._id],
		queryFn: async () => {
			if (!user?._id) return null;
			const reputationRes = await API.get(`/reputation/${user._id}`);
			return reputationRes?.data;
		},
		enabled: !!user?._id,
	});

	// Fetch followers and following
	const { data: followers = [] } = useQuery<User[]>({
		queryKey: ["followers", user?._id],
		queryFn: async () => {
			if (!user?._id) return [];
			const res = await API.get<User[]>(`/follow/${user._id}/followers`);
			return res.data || [];
		},
		enabled: !!user?._id,
	});
	const { data: following = [] } = useQuery<User[]>({
		queryKey: ["following", user?._id],
		queryFn: async () => {
			if (!user?._id) return [];
			const res = await API.get<User[]>(`/follow/${user._id}/following`);
			return res.data || [];
		},
		enabled: !!user?._id,
	});

	// Fetch answers for followed questions
	const { data: rawAnswers = [] } = useQuery<Answer[]>({
		queryKey: ["rawAnswers"],
		queryFn: async () => {
			const res = await API.get<Answer[]>("/answers");
			return res.data || [];
		},
	});

	// flags
	const isOwner = !!(authUser && user?._id === authUser._id);
	const joinedOn = useMemo(() => formatDate(user?.createdAt), [user]);
	const followersCount = followers.length;
	const followingCount = following.length;
	const topicsCount = followedTopicIds.length;
	const followedQuestionsCount = followedQuestions?.length;

	// Follow/unfollow mutation
	const isFollowing = useMemo(() => {
		if (!authUser?._id) return false;
		return followers.some((f) => f._id === authUser._id);
	}, [followers, authUser?._id]);

	const followMutation = useMutation({
		mutationFn: async () => {
			if (!user?._id) return;
			const endpoint = isFollowing ? "unfollow" : "follow";
			await API.post(`/follow/${user._id}/${endpoint}`, {});
		},
		onMutate: () => setFollowLoading(true),
		onSuccess: () => {
			toast.success(isFollowing ? "Unfollowed" : "Followed");
			queryClient.invalidateQueries({ queryKey: ["followers", user?._id] });
		},
		onError: (error: unknown) => {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err.response?.data?.error || "Something went wrong");
		},
		onSettled: () => setFollowLoading(false),
	});

	function getReputationLevel(score = 0) {
		if (score >= 1000) return "Expert";
		if (score >= 200) return "Intermediate";
		return "Beginner";
	}

	// ------------------ Tabs ------------------
	const TABS = useMemo(() => {
		const baseTabs = [
			"Profile",
			`${answerList.length} Answers`,
			`${questionList.length} Questions`,
			`${followersCount} Followers`,
			`${followingCount} Following`,
		];
		if (authUser && isOwner) {
			baseTabs.push(`${topicsCount} Topics`);
			baseTabs.push(`${followedQuestionsCount} Followed Questions`);
		}
		return baseTabs;
	}, [
		answerList.length,
		questionList.length,
		followersCount,
		followingCount,
		topicsCount,
		authUser,
		isOwner,
		followedQuestionsCount,
	]);

	const onKeyDown = (e: React.KeyboardEvent) => {
		const last = TABS.length - 1;
		let next = selected;
		if (e.key === "ArrowRight") next = selected === last ? 0 : selected + 1;
		if (e.key === "ArrowLeft") next = selected === 0 ? last : selected - 1;
		if (e.key === "Home") next = 0;
		if (e.key === "End") next = last;
		if (next !== selected) {
			e.preventDefault();
			setSelected(next);
			queueMicrotask(() => tabRefs.current[next]?.focus());
		}
	};

	// ------------------ Rendering ------------------
	if (isLoadingUser) {
		return <ProfileSkeleton />;
	}

	if (isNotFound) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
				<h1 className="text-2xl font-bold text-gray-800">Profile Not Found</h1>
				<p className="mt-2 text-gray-500">
					{`Sorry, we couldn't find a user with the username "${username}".`}
				</p>
				<Link
					href="/"
					className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
				>
					Go to Homepage
				</Link>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-6xl px-2 sm:px-4 py-6">
			<div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
				{/* Main content */}
				<section className="md:col-span-8">
					{/* Header */}
					<div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-6 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100">

	{/* LEFT: AVATAR + NAME + STATS */}
	<div className="flex flex-col sm:flex-row items-center gap-5 w-full">

		{/* Avatar */}
		<div className="h-20 w-20 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center ring-2 ring-gray-100 shadow-sm">
			{user?.avatar?.[0] ? (
				<Image
					src={
						user.avatar[0].startsWith("http")
							? user.avatar[0]
							: `${process.env.NEXT_PUBLIC_MEDIA_URL}/${user.avatar[0]}`
					}
					alt={user?.name || "User"}
					className="h-full w-full object-cover"
					width={80}
					height={80}
				/>
			) : (
				<span className="text-2xl font-bold text-gray-700">
					{getInitials(user?.name)}
				</span>
			)}
		</div>

		{/* NAME + META */}
		<div className="flex-1 text-center sm:text-left">
			<h1 className="text-2xl font-bold text-gray-900 leading-snug">
				{user?.name || "User"}
			</h1>

			<p className="mt-1 text-sm text-gray-600">
				<span className="font-semibold text-gray-900">{followersCount}</span> followers ·
				<span className="font-semibold text-gray-900"> {followingCount}</span> following ·
				<span className="font-semibold text-gray-900"> {Math.max(0, reputation?.score ?? 0)}</span> Score ·
				<span
					className={`font-semibold ${
						getReputationLevel(reputation?.score) === "Expert"
							? "text-green-600"
							: getReputationLevel(reputation?.score) === "Intermediate"
							? "text-blue-600"
							: "text-gray-700"
					}`}
				>
					{" "}
					{getReputationLevel(reputation?.score)}
				</span>
			</p>

			{/* FOLLOW BUTTON */}
			{!isOwner && (
				<ProtectedButton
					onClick={() => followMutation.mutate()}
					disabled={followLoading}
					className={`mt-3 px-5 py-1.5 rounded-full text-sm font-semibold shadow-sm transition-all ${
						isFollowing
							? "bg-gray-100 text-gray-800 hover:bg-gray-200"
							: "bg-blue-600 text-white hover:bg-blue-700"
					} ${followLoading && "opacity-50 cursor-not-allowed"}`}
				>
					{followLoading
						? "Processing..."
						: isFollowing
						? "Unfollow"
						: "Follow"}
				</ProtectedButton>
			)}
		</div>
	</div>

	{/* RIGHT: EDIT BUTTON */}
	{authUser && isOwner && (
		<div className="flex-shrink-0 w-full sm:w-auto">
			<Link
				href={`${process.env.NEXT_PUBLIC_YP_URL}/profile`}
				target="blank"
				className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition active:scale-[0.97]"
			>
				<Pencil className="h-4 w-4" />
				<span>Edit Profile</span>
			</Link>
		</div>
	)}
</div>


					{/* Tabs */}
					<nav
						className="mt-4 border-b border-gray-200 overflow-x-auto"
						role="tablist"
						onKeyDown={onKeyDown}
					>
						<div className="flex gap-4 sm:gap-6 text-sm text-gray-600 min-w-max">
							{TABS.map((label, i) => {
								const active = selected === i;
								return (
									<button
										key={label}
										ref={(el) => {
											tabRefs.current[i] = el;
										}}
										id={`tab-${i}`}
										role="tab"
										aria-selected={active}
										tabIndex={active ? 0 : -1}
										onClick={() => setSelected(i)}
										className={`relative py-3 px-2 sm:px-0 whitespace-nowrap ${
											active ? "text-blue-600" : ""
										}`}
									>
										{label}
										{active && (
											<span className="absolute inset-x-0 -bottom-px h-0.5 bg-blue-500" />
										)}
									</button>
								);
							})}
						</div>
					</nav>

					{/* Tabs content */}
					<div className="mt-5">
						{selected === 0 && (
							<ProfileTab
								questionList={questionList}
								user={user ?? null}
								answerList={answerList}
								followersCount={followersCount}
								followingCount={followingCount}
								topicsCount={topicsCount}
								followedQuestionsCount={followedQuestionsCount}
								authUser={authUser}
								isOwner={isOwner}
							/>
						)}
						{selected === 1 && (
							<AnswerTab
								questionList={questionList}
								rawQuestions={allQuestions}
								user={user ?? null}
								answerList={answerList}
							/>
						)}
						{selected === 2 && (
							<QuestionTab
								questionList={questionList}
								user={user ?? null}
								answerList={answerList}
								rawAnswers={rawAnswers}
							/>
						)}
						{selected === 3 && (
							<FollowersTab
								user={user ?? null}
								followersCount={followersCount}
								followers={followers}
							/>
						)}
						{selected === 4 && (
							<FollowingTab
								user={user ?? null}
								followingCount={followingCount}
								following={following}
							/>
						)}
						{selected === 5 && (
							<TopicsTab
								user={user ?? null}
								topics={allTopics}
								followedTopicIds={followedTopicIds}
								followersCounts={followersCounts}
							/>
						)}
						{selected === 6 && (
							<FollowedQuestion
								followedQuestions={followedQuestions}
								rawAnswers={rawAnswers}
							/>
						)}
					</div>
				</section>

				{/* Sidebar */}
				<aside className="md:col-span-4 space-y-4 mt-8 md:mt-0">
					<section className="bg-white border rounded">
						<h3 className="border-b px-4 py-3 font-semibold text-sm">
							Credentials & Highlights
						</h3>
						<ul className="divide-y">
							<li className="p-4 text-sm">Joined {joinedOn}</li>
						</ul>
					</section>
				</aside>
			</div>
		</div>
	);
}
