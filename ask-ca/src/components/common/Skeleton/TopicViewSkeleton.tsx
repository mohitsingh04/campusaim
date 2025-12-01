"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Users, FileText } from "lucide-react";
import { FaHome } from "react-icons/fa";
import Link from "next/link";

export default function TopicViewSkeleton() {
	return (
		<div className="mx-auto max-w-6xl px-2 sm:px-4 py-4">
			{/* Breadcrumb */}
			<nav className="flex items-center text-sm mb-6" aria-label="Breadcrumb">
				<ol className="inline-flex items-center space-x-1 md:space-x-2">
					<li className="inline-flex items-center">
						<Link
							href="/"
							className="inline-flex items-center text-gray-700 hover:text-blue-600"
						>
							<FaHome className="h-4 w-4 me-1" />
							Home
						</Link>
					</li>
					<li>
						<span className="mx-2 text-gray-400">/</span>
						<Link
							href="/topic/all"
							className="inline-flex items-center text-gray-700 hover:text-blue-600"
						>
							<span className="text-gray-700">Topics</span>
						</Link>
					</li>
					<li>
						<span className="mx-2 text-gray-400">/</span>
						<span>
							<Skeleton width={100} height={16} />
						</span>
					</li>
				</ol>
			</nav>

			{/* Topic header skeleton */}
			<div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow transition-shadow hover:shadow-md mb-4">
				<div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
					<div className="flex-1">
						<Skeleton width={180} height={22} />
						<Skeleton className="mt-2" width="80%" height={14} count={2} />
					</div>
				</div>
				<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 text-sm text-gray-500 mt-2">
					<div className="flex items-center space-x-1">
						<Users className="h-4 w-4 text-gray-400" />
						<Skeleton width={60} height={14} />
					</div>
					<div className="flex items-center space-x-1">
						<FileText className="h-4 w-4 text-gray-400" />
						<Skeleton width={60} height={14} />
					</div>
				</div>
			</div>

			{/* Sorting skeleton */}
			<div className="my-4 flex flex-col border-b border-gray-200 pb-2 sm:flex-row sm:items-center sm:justify-between">
				<Skeleton width={180} height={20} />
				<Skeleton width={120} height={28} />
			</div>

			{/* Question cards skeleton */}
			<div className="space-y-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={i}
						className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
					>
						<div className="flex items-center gap-3">
							<div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
							<Skeleton width={120} height={16} />
						</div>
						<Skeleton className="mt-4" width="60%" height={18} />
						<Skeleton className="mt-2" width="90%" height={14} />
						<Skeleton className="mt-2" width="80%" height={14} />
					</div>
				))}
			</div>
		</div>
	);
}
