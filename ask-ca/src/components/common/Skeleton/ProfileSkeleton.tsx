"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ProfileSkeleton() {
	return (
		<div className="mx-auto max-w-6xl px-4 py-6">
			<div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-8">
				{/* Main content */}
				<section className="md:col-span-8">
					{/* Header */}
					<div className="flex w-full items-start justify-between gap-4">
						<div className="flex items-center gap-4">
							{/* Avatar */}
							<div className="h-20 w-20 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center ring-2 ring-white shadow-lg">
								<Skeleton circle height={80} width={80} />
							</div>

							<div>
								{/* Name */}
								<Skeleton width={150} height={24} />

								{/* Followers & Following */}
								<div className="mt-2 flex gap-4">
									<Skeleton width={80} height={16} />
									<Skeleton width={80} height={16} />
								</div>

								{/* Follow button */}
								<div className="mt-3">
									<Skeleton width={100} height={32} borderRadius={20} />
								</div>
							</div>
						</div>

						{/* Share button */}
						<div className="flex-shrink-0">
							<Skeleton circle height={40} width={40} />
						</div>
					</div>

					{/* Tabs */}
					<nav className="mt-4 border-gray-200">
						<div className="flex gap-6 text-sm text-gray-600">
							{Array.from({ length: 6 }).map((_, i) => (
								<Skeleton key={i} width={70} height={20} />
							))}
						</div>
					</nav>

					{/* Tab content */}
					<div className="mt-5 space-y-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className="p-4 border border-gray-200 rounded bg-white"
							>
								<Skeleton width="60%" height={20} />
								<Skeleton width="90%" height={16} className="mt-2" />
								<Skeleton width="40%" height={16} className="mt-2" />
							</div>
						))}
					</div>
				</section>

				{/* Sidebar */}
				<aside className="md:col-span-4 space-y-4">
					<section className="bg-white border border-gray-200 rounded">
						<h3 className="border-b border-gray-200 px-4 py-3 font-semibold text-sm">
							<Skeleton width={180} height={16} />
						</h3>
						<ul className="">
							<li className="p-4 text-sm border-b border-gray-200">
								<Skeleton width={120} height={14} />
							</li>
							<li className="p-4 text-sm">
								<Skeleton width={160} height={14} />
							</li>
						</ul>
					</section>
				</aside>
			</div>
		</div>
	);
}
