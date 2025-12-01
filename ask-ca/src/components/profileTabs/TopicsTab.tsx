import React from "react";
import { User, Topic } from "@/config/Types";
import { FileText, Users } from "lucide-react";
import Link from "next/link";

interface TopicsTabProps {
	user: User | null;
	topics: Topic[];
	followedTopicIds: string[];
	followersCounts: Record<string, number>; // <-- Add this prop
}

export default function TopicsTab({
	user,
	topics,
	followedTopicIds,
	followersCounts,
}: TopicsTabProps) {
	if (!user || !topics) {
		return null;
	}

	const followedTopics = topics.filter((topic) =>
		followedTopicIds.includes(topic._id)
	);

	const followedCount = followedTopics.length;

	return (
		<section className="w-full">
			<header className="mb-4">
				<h2 className="text-xl font-semibold text-gray-800">
					{followedCount} Topics
				</h2>
				<hr className="mt-2 border-gray-200" />
			</header>

			{followedCount === 0 ? (
				<div className="flex items-center justify-center h-32">
					<p className="text-sm text-gray-500 italic">No Topics yet.</p>
				</div>
			) : (
				<div>
					<ul className="space-y-3">
						{followedTopics.map((topic) => (
							<li
								key={topic._id}
								className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-blue-300"
							>
								<div>
									<Link
										href={`/topic/${topic.slug}`}
										target="blank"
										prefetch={true}
									>
										<p className="text-sm font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
											{topic.category_name || "N/A"}
										</p>
									</Link>
									<p
										className="mt-1 text-sm text-gray-600 line-clamp-2"
										dangerouslySetInnerHTML={{
											__html: topic.description || "",
										}}
									/>
									<div className="flex items-center space-x-6 text-sm text-gray-500">
										<div className="flex items-center space-x-1">
											<Users className="w-4 h-4 text-gray-400" />
											<span>{followersCounts[topic._id] ?? 0} followers</span>
										</div>
										<div className="flex items-center space-x-1">
											<FileText className="w-4 h-4 text-gray-400" />
											<span>{topic.questions?.length ?? 0} questions</span>
										</div>
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			)}
		</section>
	);
}
