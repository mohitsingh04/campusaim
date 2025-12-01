"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function QuestionDetailsSkeleton() {
	return (
		<div className="mx-auto max-w-5xl space-y-10 px-4 sm:px-6 lg:px-0">
			{/* QUESTION CARD SKELETON */}
			<section className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
				<div className="mb-6 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
					<Skeleton width={120} />
					<Skeleton width={100} />
					<Skeleton width={60} />
				</div>

				<div className="grid grid-cols-[3rem_1fr] gap-6">
					{/* Votes column */}
					<div className="flex w-16 flex-col items-center justify-start rounded-l-xl bg-gray-50 p-3">
						<Skeleton circle width={20} height={20} />
						<Skeleton width={20} height={10} className="mt-1" />
						<div className="my-2 h-px w-6 bg-gray-200" />
						<Skeleton circle width={20} height={20} />
						<Skeleton width={20} height={10} className="mt-1" />
					</div>

					{/* Question body */}
					<div>
						<h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
							<Skeleton width={`80%`} height={32} />
						</h1>

						<div className="mb-3">
							<Skeleton width={100} height={24} />
						</div>

						<div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4 text-sm">
							<Skeleton width={200} height={32} />
						</div>
					</div>
				</div>
			</section>

			{/* ANSWERS SKELETON */}
			<section className="rounded-xl border border-gray-200 bg-white shadow-sm">
				<div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
					<h2 className="text-lg font-semibold text-gray-900">
						<Skeleton width={120} />
					</h2>
				</div>

				<article className="border-b px-6 py-6 last:border-b-0">
					<div className="grid grid-cols-[3rem_1fr] gap-6">
						<div className="flex w-16 flex-col items-center justify-start rounded-l-xl bg-gray-50 p-3">
							<Skeleton circle width={20} height={20} />
							<Skeleton width={20} height={10} className="mt-1" />
							<div className="my-2 h-px w-6 bg-gray-200" />
							<Skeleton circle width={20} height={20} />
							<Skeleton width={20} height={10} className="mt-1" />
						</div>

						<div>
							<Skeleton count={3} className="mb-2" />
							<div className="mt-3 flex gap-4 text-sm text-gray-700">
								<Skeleton width={120} height={16} />
								<Skeleton width={80} height={16} />
							</div>
						</div>
					</div>
				</article>
			</section>
		</div>
	);
}
