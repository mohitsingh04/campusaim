"use client";

import { API } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Home, CircleQuestionMark, Compass, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AxiosError } from "axios";
import LeftSidebarSkeleton from "@/components/common/Skeleton/LeftSidebarSkeleton";

const menuItems = [
	{ icon: Home, label: "Home", path: "/" },
	{ icon: Compass, label: "Topics", path: "/topic" },
	{
		icon: CircleQuestionMark,
		label: "Questions",
		path: "/question",
	},
];

type Topic = {
	_id: string;
	category_name: string;
	slug: string;
	parent_category?: string;
	questionCount?: number;
};

export default function LeftSidebar() {
	const pathname = usePathname();

	const {
		data: topics = [],
		isLoading,
		isError,
	} = useQuery<Topic[]>({
		queryKey: ["topTopics"],
		queryFn: async () => {
			try {
				const topicRes = await API.get(`/top-categories`);
				return topicRes.data || [];
			} catch (error) {
				const err = error as AxiosError<{ error: string }>;
				toast.error(err.response?.data?.error || "Something went wrong.");
				throw new Error("Failed to fetch topics");
			}
		},
	});

	if (isLoading) {
		return <LeftSidebarSkeleton />;
	}

	if (isError) {
		return <div className="p-4">Error loading topics.</div>;
	}

	return (
		<div className="space-y-4 lg:space-y-6 lg:sticky lg:top-24">
			{/* Menu's */}
			<div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
				<nav className="space-y-1">
					{menuItems.map((item) => (
						<Link
							key={item.label}
							href={item.path}
							className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
								pathname === item.path
									? "bg-blue-50 text-blue-700 font-medium"
									: "text-slate-600 hover:bg-slate-50"
							}`}
						>
							<item.icon className="w-5 h-5" />
							<span>{item.label}</span>
						</Link>
					))}
				</nav>
			</div>

			{/* Top Categories */}
			<div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
				<h3 className="font-semibold text-slate-900 mb-3">Top Topics</h3>
				<div className="space-y-2">
					{topics.slice(0, 5).map((t) => (
						<Link
							key={t._id}
							href={`/topic/${t.slug}`}
							className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
						>
							<span className="text-slate-700 text-sm truncate">
								{t.category_name}
							</span>
							<span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
								{t.questionCount || 0}
							</span>
						</Link>
					))}
					{topics.length > 5 && (
						<Link
							href="/topic"
							className="group mt-2 flex items-center gap-1.5 px-3 text-sm font-medium text-blue-600"
						>
							<span>View all topics</span>
							<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
