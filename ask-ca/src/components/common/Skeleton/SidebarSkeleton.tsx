"use client";

import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function SidebarSkeleton() {
	return (
		<>
			{/* Desktop Sidebar Skeleton */}
			<div className="hidden lg:block w-64 bg-white shadow-md min-h-screen sticky top-16">
				<div className="p-6">
					{/* Nav items skeleton */}
					<div className="space-y-3 mb-6">
						<div className="flex items-center space-x-3 px-3 py-2">
							<Skeleton circle width={20} height={20} />
							<Skeleton width={100} height={16} />
						</div>
						<div className="flex items-center space-x-3 px-3 py-2">
							<Skeleton circle width={20} height={20} />
							<Skeleton width={100} height={16} />
						</div>
					</div>

					<div className="space-y-3">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="flex items-center space-x-2 px-3 py-2">
								<Skeleton circle width={12} height={12} />
								<Skeleton width={120} height={16} />
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
}
