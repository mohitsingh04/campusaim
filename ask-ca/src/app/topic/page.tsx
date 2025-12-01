"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Users, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import { API } from "@/services/api";
import TopicCard from "@/components/cards/TopicCard";
import { useAuth } from "@/context/AuthContext";
import { TopicCardSkeletonGrid } from "@/components/common/Skeleton/TopicCardSkeleton";
import { AxiosError } from "axios";

type Filter = "all" | "following";

interface ApiCategory {
	_id: string;
	category_name: string;
	parent_category: string;
	description: string;
	slug: string;
	questions: string[];
}

type Topic = {
	_id: string;
	category_name: string;
	parent_category?: string;
	description: string;
	slug: string;
	questions: string[];
};

export default function TopicsPage() {
	const { authUser } = useAuth();
	const [topicList, setTopicList] = useState<Topic[]>([]);
	const [followingIds, setFollowingIds] = useState<string[]>([]);
	const [followersCounts, setFollowersCounts] = useState<
		Record<string, number>
	>({});
	const [filterBy, setFilterBy] = useState<Filter>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// Fetch topics
	const fetchData = useCallback(async () => {
		try {
			setIsLoading(true);
			const topicRes = await API.get("/categories");
			const raw = Array.isArray(topicRes?.data)
				? topicRes.data
				: topicRes?.data?.data ?? [];

			const mappedTopics: Topic[] = (raw as ApiCategory[])
				.filter((a) => a?.parent_category === "Ask")
				.map((t) => ({
					_id: t._id,
					category_name: t.category_name,
					parent_category: t.parent_category,
					description: t.description,
					slug: t.slug,
					questions: t.questions || [],
				}));

			setTopicList(mappedTopics);
		} catch (error) {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err.response?.data?.error || "Something went wrong.");
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Fetch followed categories for the user
	const fetchFollowedCategories = useCallback(async () => {
		if (!authUser?._id) return;
		try {
			const res = await API.get(`/category/${authUser._id}/categories`);
			const ids = Array.isArray(res.data)
				? res.data.map((c: ApiCategory) => c._id)
				: [];
			setFollowingIds(ids);
		} catch {
			setFollowingIds([]);
		}
	}, [authUser?._id]);

	// Fetch followers count for all topics
	const fetchFollowersCounts = useCallback(async (topics: Topic[]) => {
		const counts: Record<string, number> = {};
		await Promise.all(
			topics.map(async (topic) => {
				try {
					const res = await API.get(`/category/${topic._id}/followers`);
					counts[topic._id] = Array.isArray(res.data) ? res.data.length : 0;
				} catch {
					counts[topic._id] = 0;
				}
			})
		);
		setFollowersCounts(counts);
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		if (topicList.length > 0) {
			fetchFollowersCounts(topicList);
		}
	}, [topicList, fetchFollowersCounts]);

	useEffect(() => {
		fetchFollowedCategories();
	}, [fetchFollowedCategories]);

	const displayedTopics = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		return topicList.filter((t) => {
			if (filterBy === "following" && !followingIds.includes(t._id))
				return false;
			if (q && !t.category_name.toLowerCase().includes(q)) return false;
			return true;
		});
	}, [topicList, filterBy, searchQuery, followingIds]);

	const handleToggleFollow = async (id: string, newState: boolean) => {
		setFollowingIds((prev) =>
			newState ? [...prev, id] : prev.filter((fid) => fid !== id)
		);
		try {
			const res = await API.get(`/category/${id}/followers`);
			setFollowersCounts((prev) => ({
				...prev,
				[id]: Array.isArray(res.data) ? res.data.length : 0,
			}));
		} catch {
			// ignore
		}
	};

	return (
		<div className="w-full px-2 sm:px-4 py-4">
			{/* Search and Filters */}
			<div className="mb-6 sm:mb-8 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					{/* Search */}
					<div className="relative w-full md:max-w-md flex-1">
						<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search topics..."
							className="w-full rounded-full border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500 text-sm"
						/>
					</div>

					{/* Filters */}
					<div className="flex flex-wrap items-center gap-2">
						<button
							onClick={() => setFilterBy("all")}
							className={`flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
								filterBy === "all"
									? "bg-blue-100 text-blue-700 shadow-sm border border-blue-200"
									: "text-gray-600 hover:bg-gray-100 border border-gray-200"
							}`}
						>
							<BookOpen className="h-4 w-4" />
							<span>All Topics</span>
						</button>
						<button
							onClick={() => setFilterBy("following")}
							className={`flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
								filterBy === "following"
									? "bg-blue-100 text-blue-700 shadow-sm border border-blue-200"
									: "text-gray-600 hover:bg-gray-100 border border-gray-200"
							}`}
						>
							<Users className="h-4 w-4" />
							<span>Following</span>
						</button>
					</div>
				</div>
			</div>

			{/* Stats */}
			<div className="mb-6 sm:mb-8 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
				<div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-4 sm:p-6">
					<div className="flex items-center space-x-3">
						<BookOpen className="h-8 w-8 text-blue-600" />
						<div>
							<div className="text-xl sm:text-2xl font-bold text-blue-900">
								{topicList.length}
							</div>
							<div className="text-blue-700 text-sm sm:text-base">
								Total Topics
							</div>
						</div>
					</div>
				</div>

				<div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-4 sm:p-6">
					<div className="flex items-center space-x-3">
						<Users className="h-8 w-8 text-green-600" />
						<div>
							<div className="text-xl sm:text-2xl font-bold text-green-900">
								{followingIds.length}
							</div>
							<div className="text-green-700 text-sm sm:text-base">
								Following
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Topics Grid */}
			{isLoading ? (
				<TopicCardSkeletonGrid />
			) : (
				<div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{displayedTopics.map((topic) => (
						<TopicCard
							key={topic._id}
							topic={topic}
							authUser={authUser}
							isFollowing={followingIds.includes(topic._id)}
							followersCount={followersCounts[topic._id] ?? 0}
							onToggleFollow={handleToggleFollow}
						/>
					))}
				</div>
			)}
		</div>
	);
}
