"use client";

import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function HeaderSkeleton() {
	return (
		<header className="bg-white shadow-sm sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Left: Logo Skeleton */}
					<div className="flex items-center space-x-2">
						<Skeleton width={100} height={32} />
					</div>

					{/* Center: Search Skeleton */}
					<div className="flex-1 flex justify-center px-4">
						<div className="w-full max-w-lg">
							<Skeleton height={40} width="100%" borderRadius="9999px" />
						</div>
					</div>

					{/* Right: Nav/Icons Skeleton */}
					<div className="hidden md:flex items-center space-x-6">
						<Skeleton width={120} height={32} borderRadius="9999px" />
					</div>
				</div>
			</div>
		</header>
	);
}
