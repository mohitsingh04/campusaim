"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Users, FileText } from "lucide-react";

type TopicCardSkeletonProps = {
	className?: string;
	showButton?: boolean;
	descriptionLines?: number;
};

export default function TopicCardSkeleton({
	className = "",
	showButton = true,
	descriptionLines = 2,
}: TopicCardSkeletonProps) {
	return (
		<SkeletonTheme baseColor="#e5e7eb" highlightColor="#f3f4f6">
			<div
				className={`rounded-xl border border-gray-200 bg-white p-6 shadow transition-shadow hover:shadow-md ${className}`}
				aria-busy="true"
				aria-live="polite"
			>
				<div className="mb-3 flex items-start justify-between">
					<div className="flex-1">
						{/* Title */}
						<Skeleton height={22} width="60%" />

						{/* Description */}
						<div className="mt-2 space-y-2">
							<Skeleton height={14} />
							{descriptionLines > 1 && <Skeleton height={14} width="90%" />}
							{descriptionLines > 2 && <Skeleton height={14} width="80%" />}
						</div>
					</div>

					{showButton && (
						<div className="ml-4">
							<Skeleton height={28} width={96} borderRadius={9999} />
						</div>
					)}
				</div>

				{/* Stats row */}
				<div className="flex items-center space-x-6 text-sm text-gray-500">
					<div className="flex items-center space-x-2">
						<Users className="h-4 w-4 text-gray-300" />
						<Skeleton height={14} width={90} />
					</div>
					<div className="flex items-center space-x-2">
						<FileText className="h-4 w-4 text-gray-300" />
						<Skeleton height={14} width={90} />
					</div>
				</div>
			</div>
		</SkeletonTheme>
	);
}

type TopicCardSkeletonGridProps = {
	count?: number; // default 6
	containerClassName?: string;
	itemClassName?: string;
	showButton?: boolean;
	descriptionLines?: number;
};

export function TopicCardSkeletonGrid({
	count = 6,
	containerClassName = "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
	itemClassName,
	showButton = true,
	descriptionLines = 2,
}: TopicCardSkeletonGridProps) {
	return (
		<div className={containerClassName}>
			{Array.from({ length: count }).map((_, i) => (
				<TopicCardSkeleton
					key={i}
					className={itemClassName}
					showButton={showButton}
					descriptionLines={descriptionLines}
				/>
			))}
		</div>
	);
}
