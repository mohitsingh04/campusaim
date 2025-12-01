"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState, useMemo, useRef } from "react";
import { Search, Plus, Bell, Menu, X } from "lucide-react";
import debounce from "lodash.debounce";
import { API } from "@/services/api";
import HeaderSkeleton from "../common/Skeleton/HeaderSkeleton";
import ProfileDropdown from "./ProfileDropdown";
import Image from "next/image";
import Notifications from "../notification/Notification";
import Tooltip from "../common/Tooltip/Tooltip";
import { useQuery, useMutation } from "@tanstack/react-query";

type Topic = {
	_id: string;
	category_name: string;
	slug: string;
	parent_category?: string;
};
type Question = {
	_id: string;
	title: string;
	category?: Topic | null;
	slug: string;
};
type User = { _id: string; username: string; name: string };
type SearchResults = { questions: Question[]; topics: Topic[]; users: User[] };
type Notification = { _id: string; isRead: boolean };

export default function Navbar({
	setSidebarOpen,
	sidebarOpen = false,
}: {
	setSidebarOpen: (open: boolean) => void;
	sidebarOpen?: boolean;
}) {
	const { authUser, authLoading } = useAuth();

	const [searchQuery, setSearchQuery] = useState<string>("");
	const [searchResults, setSearchResults] = useState<SearchResults>({
		questions: [],
		topics: [],
		users: [],
	});
	const [showNotifications, setShowNotifications] = useState(false);
	const [showMobileSearch, setShowMobileSearch] = useState(false);

	const notificationRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Fetch topics, questions, users
	const { data: topics = [] } = useQuery<Topic[]>({
		queryKey: ["topics"],
		queryFn: async () => {
			const res = await API.get("/category");
			const all = (res?.data ?? []) as Topic[];
			return all.filter((a) => a.parent_category === "Ask");
		},
	});

	const { data: questions = [] } = useQuery<Question[]>({
		queryKey: ["questions"],
		queryFn: async () => {
			const res = await API.get("/questions");
			return (res?.data?.data ?? []) as Question[];
		},
	});

	const { data: users = [] } = useQuery<User[]>({
		queryKey: ["users"],
		queryFn: async () => {
			const res = await API.get("/users");
			return (res?.data?.data ?? []) as User[];
		},
	});

	// Fetch notifications
	const { data: notifications = [], refetch: refetchNotifications } = useQuery<
		Notification[]
	>({
		queryKey: ["notifications", authUser?._id],
		queryFn: async () => {
			if (!authUser) return [];
			const res = await API.get("/notifications");
			return res.data as Notification[];
		},
		enabled: !!authUser,
	});

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	// Mark all as read when opening notifications
	const markAllAsReadMutation = useMutation({
		mutationFn: async () => {
			const unread = notifications.filter((n) => !n.isRead);
			await Promise.all(
				unread.map((n) => API.patch(`/notifications/${n._id}/read`))
			);
		},
		onSuccess: () => {
			refetchNotifications();
		},
	});

	// Mark as read when opening notifications
	useMemo(() => {
		if (showNotifications && unreadCount > 0) {
			markAllAsReadMutation.mutate();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showNotifications, unreadCount]);

	const performSearch = useMemo(
		() =>
			debounce((query: string) => {
				const lower = query.trim().toLowerCase();

				function prioritize<T>(arr: T[], key: keyof T, lower: string): T[] {
					return arr
						.filter((item) =>
							(item[key] ?? "").toString().toLowerCase().includes(lower)
						)
						.sort((a, b) => {
							const aStr = (a[key] ?? "").toString().toLowerCase();
							const bStr = (b[key] ?? "").toString().toLowerCase();
							const aStarts = aStr.startsWith(lower);
							const bStarts = bStr.startsWith(lower);
							if (aStarts === bStarts) return 0;
							return aStarts ? -1 : 1;
						});
				}

				setSearchResults({
					questions: prioritize(questions, "title", lower),
					topics: prioritize(topics, "category_name", lower),
					users: prioritize(users, "name", lower),
				});
			}, 300),
		[questions, topics, users]
	);

	const clearSearch = () => {
		setSearchQuery("");
		setSearchResults({ questions: [], topics: [], users: [] });
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchQuery(value);
		if (!value.trim()) {
			setSearchResults({ questions: [], topics: [], users: [] });
			return;
		}
		performSearch(value);
	};

	// Click outside for search
	useMemo(() => {
		if (!searchQuery) return;
		function handleClickOutside(event: MouseEvent) {
			if (
				searchInputRef.current &&
				!searchInputRef.current.contains(event.target as Node) &&
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				clearSearch();
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [searchQuery]);

	// Click outside for notifications
	useMemo(() => {
		if (!showNotifications) return;
		function handleClickOutside(event: MouseEvent) {
			if (
				notificationRef.current &&
				!notificationRef.current.contains(event.target as Node)
			) {
				setShowNotifications(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showNotifications]);

	if (authLoading) return <HeaderSkeleton />;

	return (
		<header className="bg-white shadow-sm sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Mobile menu button */}
					<button
						className="lg:hidden mr-2 p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none cursor-pointer"
						aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
						onClick={() => setSidebarOpen(!sidebarOpen)}
					>
						{sidebarOpen ? (
							<X className="h-6 w-6" />
						) : (
							<Menu className="h-6 w-6" />
						)}
					</button>

					{/* Logo */}
					<Link
						href="/"
						className="flex items-center space-x-2"
						prefetch={true}
					>
						<Image
							src="/logo-black-new.png"
							alt="AskHub Full Logo"
							width={160}
							height={48}
							className="rounded-lg"
						/>
					</Link>

					{/* Search (desktop only) */}
					<div className="hidden lg:flex flex-1 max-w-lg mx-8 relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
						<input
							ref={searchInputRef}
							type="text"
							value={searchQuery}
							onChange={handleSearchChange}
							placeholder="Search questions, topics, or users..."
							className="w-full pl-12 pr-4 py-2.5 text-sm text-gray-800 bg-gray-100 border border-blue-500 rounded-full transition-all duration-200 ease-in-out focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
						{searchQuery && (
							<div
								ref={dropdownRef}
								className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-full z-50 max-h-72 overflow-y-auto"
							>
								{searchResults.questions.length === 0 &&
								searchResults.topics.length === 0 &&
								searchResults.users.length === 0 ? (
									<div className="px-4 py-6 text-center text-gray-500">
										<span className="text-lg">🔍</span>
										<p className="mt-1 text-sm">No results found</p>
									</div>
								) : (
									<>
										{searchResults.questions.length > 0 && (
											<div>
												<div className="sticky top-0 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
													Questions
												</div>
												{searchResults.questions.map((q) => (
													<Link
														href={`/question/${q.slug}`}
														key={q._id}
														className="flex items-center px-4 py-2 hover:bg-gray-100 transition ease-in-out"
														onClick={clearSearch}
													>
														<span className="mr-2">❓</span>
														<div>
															<p className="text-sm font-medium text-gray-800">
																{q.title}
															</p>
															<p className="text-xs text-gray-500">
																{q.category?.category_name}
															</p>
														</div>
													</Link>
												))}
											</div>
										)}
										{searchResults.topics.length > 0 && (
											<div>
												<div className="sticky top-0 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
													Topics
												</div>
												{searchResults.topics.map((t) => (
													<Link
														href={`/topic/${t.slug}`}
														key={t._id}
														className="flex items-center px-4 py-2 hover:bg-gray-100 transition ease-in-out"
														onClick={clearSearch}
													>
														<span className="mr-2">🏷</span>
														<p className="text-sm text-gray-800">
															{t.category_name}
														</p>
													</Link>
												))}
											</div>
										)}
										{searchResults.users.length > 0 && (
											<div>
												<div className="sticky top-0 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
													Authors
												</div>
												{searchResults.users.map((u) => (
													<Link
														href={`/profile/${u.username}`}
														key={u._id}
														className="flex items-center px-4 py-2 hover:bg-gray-100 transition ease-in-out"
														onClick={clearSearch}
													>
														<span className="mr-2">👤</span>
														<div>
															<p className="text-sm font-medium text-gray-800">
																{u.name}
															</p>
															<p className="text-xs text-gray-500">
																{u.username}
															</p>
														</div>
													</Link>
												))}
											</div>
										)}
									</>
								)}
							</div>
						)}
					</div>

					{/* Desktop Nav */}
					<nav className="flex items-center space-x-4">
						{!authUser ? (
							<Link
								href="/auth/login"
								className="text-gray-600 hover:text-gray-900"
							>
								Login
							</Link>
						) : (
							<>
								{/* Ask Question button (desktop only) */}
								<Link
									href="/question/ask"
									className="hidden sm:inline-flex group items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 ease-in-out hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
								>
									<Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
									<span className="hidden sm:inline">Ask Question</span>
								</Link>
								{/* Search icon (mobile only) */}
								<button
									className="inline-flex sm:hidden items-center justify-center rounded-lg bg-blue-600 p-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
									aria-label="Search"
									onClick={() => setShowMobileSearch(true)}
								>
									<Search className="h-5 w-5" />
								</button>
								<div className="relative" ref={notificationRef}>
									<Tooltip text="Notifications">
										<button
											onClick={() => setShowNotifications((prev) => !prev)}
											className="relative p-2 text-gray-600 hover:text-gray-900 cursor-pointer"
											aria-label="Notifications"
										>
											<Bell className="h-6 w-6" />
											{unreadCount > 0 && (
												<span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
											)}
										</button>
									</Tooltip>
									{showNotifications && (
										<div className="absolute right-0 mt-2 w-80 bg-white shadow-lg border border-gray-200 rounded-lg z-50">
											<Notifications
												onClose={() => setShowNotifications(false)}
											/>
										</div>
									)}
								</div>
								<Tooltip text="Profile">
									<ProfileDropdown />
								</Tooltip>
							</>
						)}
					</nav>
				</div>
			</div>
			{/* Mobile search modal (optional, implement as you like) */}
			{showMobileSearch && (
				<div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center pt-3">
					<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-2 p-0 relative border border-gray-200">
						{/* Close button */}
						<button
							className="absolute top-5 border border-gray-400 right-5 text-gray-400 hover:text-gray-700 bg-gray-300 rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
							onClick={() => setShowMobileSearch(false)}
							aria-label="Close"
						>
							<X className="h-5 w-5" />
						</button>
						{/* Search input */}
						<div className="flex items-center px-4 pt-4 pb-2 border-b border-gray-100">
							<Search className="h-5 w-5 text-gray-400 mr-2" />
							<input
								type="search"
								value={searchQuery}
								onChange={handleSearchChange}
								placeholder="Search questions, topics, or users..."
								className="w-full px-3 py-2 text-base rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
								autoFocus
							/>
						</div>
						{/* Results */}
						<div className="max-h-80 overflow-y-auto px-2 py-2">
							{searchQuery && (
								<>
									{searchResults.questions.length === 0 &&
									searchResults.topics.length === 0 &&
									searchResults.users.length === 0 ? (
										<div className="px-4 py-8 text-center text-gray-500">
											<span className="text-2xl">🔍</span>
											<p className="mt-2 text-base">No results found</p>
										</div>
									) : (
										<>
											{searchResults.questions.length > 0 && (
												<div>
													<div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 rounded mb-1">
														Questions
													</div>
													{searchResults.questions.map((q) => (
														<Link
															href={`/question/${q.slug}`}
															key={q._id}
															className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition"
															onClick={() => {
																clearSearch();
																setShowMobileSearch(false);
															}}
														>
															<span className="text-red-500 text-lg">❓</span>
															<span className="font-medium text-gray-900">
																{q.title}
															</span>
														</Link>
													))}
												</div>
											)}
											{searchResults.topics.length > 0 && (
												<div className="mt-3">
													<div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 rounded mb-1">
														Topics
													</div>
													{searchResults.topics.map((t) => (
														<Link
															href={`/topic/${t.slug}`}
															key={t._id}
															className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition"
															onClick={() => {
																clearSearch();
																setShowMobileSearch(false);
															}}
														>
															<span className="text-blue-500 text-lg">🏷</span>
															<span className="font-medium text-gray-900">
																{t.category_name}
															</span>
														</Link>
													))}
												</div>
											)}
											{searchResults.users.length > 0 && (
												<div className="mt-3">
													<div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 rounded mb-1">
														Authors
													</div>
													{searchResults.users.map((u) => (
														<Link
															href={`/profile/${u.username}`}
															key={u._id}
															className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition"
															onClick={() => {
																clearSearch();
																setShowMobileSearch(false);
															}}
														>
															<span className="text-green-500 text-lg">👤</span>
															<div>
																<span className="font-medium text-gray-900">
																	{u.name}
																</span>
																<span className="block text-xs text-gray-500">
																	{u.username}
																</span>
															</div>
														</Link>
													))}
												</div>
											)}
										</>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</header>
	);
}