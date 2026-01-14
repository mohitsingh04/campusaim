"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Home,
	Compass,
	Plus,
	ArrowRight,
	CircleQuestionMark,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { API } from "@/services/api";
import SidebarSkeleton from "../common/Skeleton/SidebarSkeleton";
import { useQuery } from "@tanstack/react-query";

const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

type Topic = {
	_id: string;
	category_name: string;
	slug: string;
	parent_category?: string;
	questions?: [];
};

export default function Sidebar({
	sidebarOpen,
	setSidebarOpen,
}: {
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
}) {
	const { authUser, authLoading } = useAuth();
	const pathname = usePathname();

	const { data: followedTopics = [], isLoading } = useQuery<
		(Topic & { color: string })[]
	>({
		queryKey: ["followedTopics", authUser?._id],
		queryFn: async () => {
			if (!authUser?._id) return [];
			try {
				const followedRes = await API.get(
					`/category/${authUser._id}/categories`
				);
				const followed = Array.isArray(followedRes.data)
					? followedRes.data
					: [];

				const allRes = await API.get("/categories");
				const all = Array.isArray(allRes.data)
					? allRes.data
					: allRes.data?.data ?? [];

				const topics = all.filter(
					(cat: Topic) =>
						followed.some((f: { _id: string }) => f._id === cat._id) &&
						cat.parent_category === "Ask"
				);

				return topics.map((cat: Topic, idx: number) => ({
					...cat,
					color: colors[idx % colors.length],
				}));
			} catch {
				toast.error("Could not load topics");
				return [];
			}
		},
		enabled: !!authUser?._id,
	});

	const nav = [
		{ icon: Home, label: "Home", path: "/" },
		{ icon: Compass, label: "Topics", path: "/topic" },
		{ icon: CircleQuestionMark, label: "Questions", path: "/question" },
	];

	if (authLoading || isLoading) return <SidebarSkeleton />;

	return (
		<>
			{/* Desktop Sidebar */}
			<aside className="hidden lg:block w-64 flex-shrink-0">
				<div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-gray-200 bg-white p-4">
					<nav className="space-y-1">
						{nav.map((item) => (
							<Link
								key={item.path}
								href={item.path}
								className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
									pathname === item.path
										? "border-l-4 border-purple-600 bg-purple-50 text-purple-700 font-semibold"
										: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
								}`}
							>
								<item.icon className="h-5 w-5 flex-shrink-0" />
								<span>{item.label}</span>
							</Link>
						))}
					</nav>
					<div className="mt-8 pt-4 border-t border-gray-200">
						<div className="mb-2 flex items-center justify-between px-3">
							<h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
								Your Topics
							</h3>
							<Link
								href="/topic"
								className="text-xs font-medium text-purple-600 hover:underline"
							>
								Manage
							</Link>
						</div>
						{followedTopics.length > 0 ? (
							<>
								<div className="space-y-1">
									{followedTopics.slice(0, 5).map((t) => (
										<Link
											key={t._id}
											href={`/topic/${t.slug}`}
											className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100"
										>
											<div
												className="h-2 w-2 flex-shrink-0 rounded-full"
												style={{ backgroundColor: t.color || "#cccccc" }}
											/>
											<div className="flex items-center justify-between w-full">
												<span className="truncate">{t.category_name}</span>
												<span className="ml-2 min-w-[1.5rem] px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full text-center">
													{t.questions?.length}
												</span>
											</div>
										</Link>
									))}
								</div>
								{followedTopics.length > 5 && (
									<Link
										href="/topic"
										className="group mt-2 flex items-center gap-1.5 px-3 text-sm font-medium text-purple-600"
									>
										<span>View all topics</span>
										<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
									</Link>
								)}
							</>
						) : (
							<div className="mt-2 px-3">
								<Link
									href="/topic"
									className="block rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400"
								>
									<Compass className="mx-auto h-8 w-8 text-gray-400" />
									<p className="mt-2 text-sm font-semibold text-gray-800">
										Discover Topics
									</p>
									<p className="mt-1 text-xs text-gray-500">
										Follow topics to personalize your feed.
									</p>
								</Link>
							</div>
						)}
					</div>
				</div>
			</aside>

			{/* Mobile Sidebar (with smooth transition) */}
			<div
				className={`fixed inset-0 z-40 lg:hidden top-16 transition-all duration-300 ${
					sidebarOpen ? "pointer-events-auto" : "pointer-events-none"
				}`}
			>
				{/* Overlay */}
				<div
					className={`absolute inset-0 bg-white/30 backdrop-blur-md transition-opacity duration-300 ${
						sidebarOpen ? "opacity-100" : "opacity-0"
					}`}
					onClick={() => setSidebarOpen(false)}
				/>
				{/* Sidebar panel */}
				<div
					className={`
						absolute left-0 top-0 bottom-0 w-64 bg-white shadow-md z-50 p-6 overflow-y-auto
						transform transition-transform duration-300 ease-in-out
						${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
					`}
					style={{ willChange: "transform" }}
				>
					{/* Navigation */}
					<nav className="space-y-2 mb-2">
						{nav.map((item) => (
							<Link
								key={item.path}
								href={item.path}
								className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
									pathname === item.path
										? "bg-purple-50 text-purple-600 border-r-2 border-purple-600"
										: "text-gray-700 hover:bg-gray-100"
								}`}
								onClick={() => setSidebarOpen(false)}
							>
								<item.icon className="w-5 h-5" />
								<span className="font-medium">{item.label}</span>
							</Link>
						))}
					</nav>

					<div className="mt-6">
						<h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center justify-between">
							Your Topics
							<Link
								href="/topic"
								onClick={() => setSidebarOpen(false)}
								prefetch={true}
							>
								<Plus className="w-4 h-4 text-gray-500" />
							</Link>
						</h3>

						{followedTopics.length ? (
							<>
								{followedTopics.map((t) => (
									<Link
										key={t._id}
										href={`/topic/${t.slug}`}
										className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100"
										onClick={() => setSidebarOpen(false)}
									>
										<div
											className="h-2 w-2 flex-shrink-0 rounded-full me-1"
											style={{ backgroundColor: t.color || "#cccccc" }}
										/>
										<div className="flex items-center justify-between w-full">
											<span className="truncate">{t.category_name}</span>
											<span className="ml-2 min-w-[1.5rem] px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full text-center">
												{t.questions?.length}
											</span>
										</div>
									</Link>
								))}
							</>
						) : (
							<Link
								href="/topic"
								className="text-sm text-gray-500 px-3"
								onClick={() => setSidebarOpen(false)}
							>
								Discover topics to follow
							</Link>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
