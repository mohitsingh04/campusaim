"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function NotificationsSkeleton() {
	return (
		<div className="mx-auto max-w-6xl py-8 px-2 sm:px-0">
			<h1 className="text-2xl font-bold mb-6 text-gray-900">
				<Skeleton width={180} />
			</h1>
			<div className="bg-white border border-gray-200 rounded-xl shadow-sm">
				<ul className="divide-y divide-gray-100">
					{Array.from({ length: 6 }).map((_, i) => (
						<li key={i} className="p-4">
							<div className="flex items-center gap-2 mb-1">
								<Skeleton width={80} height={16} />
								<Skeleton width={120} height={16} />
							</div>
							<Skeleton width="60%" height={14} className="mb-1" />
							<Skeleton width={90} height={12} />
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
