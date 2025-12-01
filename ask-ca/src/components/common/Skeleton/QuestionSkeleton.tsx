"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function QuestionSkeleton() {
	return (
		<div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow space-y-5">
			{/* Title */}
			<div className="relative">
				<Skeleton width={120} height={16} /> {/* Label */}
				<div className="mt-2">
					<Skeleton height={40} borderRadius={8} /> {/* Input */}
				</div>
			</div>

			{/* Category */}
			<div>
				<Skeleton width={80} height={16} /> {/* Label */}
				<div className="mt-2">
					<Skeleton height={40} borderRadius={8} /> {/* Select */}
				</div>
			</div>

			{/* Submit */}
			<div className="pt-2">
				<Skeleton height={38} width={140} borderRadius={8} /> {/* Button */}
			</div>
		</div>
	);
}
