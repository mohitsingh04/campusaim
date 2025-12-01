import React from "react";
import { User, Question, Answer } from "@/config/Types";

interface ProfileTabProps {
	questionList: Question[];
	user: User | null;
	answerList: Answer[];
	followersCount: number;
	followingCount: number;
	topicsCount: number;
	followedQuestionsCount: number;
	authUser: User | null;
	isOwner: boolean;
}

export default function ProfileTab({
	questionList,
	answerList,
	followersCount,
	followingCount,
	topicsCount,
	followedQuestionsCount,
	authUser,
	isOwner,
}: ProfileTabProps) {
	return (
		<section className="w-full">
			<header className="mb-4">
				<hr className="mt-2 border-gray-200" />
			</header>

			<div className="grid grid-cols-2 gap-6">
				<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
					<p className="text-base font-medium text-gray-900 group-hover:text-blue-600">
						{questionList.length} Questions
					</p>
				</div>

				<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
					<p className="text-base font-medium text-gray-900 group-hover:text-blue-600">
						{answerList.length} Answers
					</p>
				</div>

				<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
					<p className="text-base font-medium text-gray-900 group-hover:text-blue-600">
						{followersCount} Followers
					</p>
				</div>

				<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
					<p className="text-base font-medium text-gray-900 group-hover:text-blue-600">
						{followingCount} Following
					</p>
				</div>

				<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
					<p className="text-base font-medium text-gray-900 group-hover:text-blue-600">
						{topicsCount} Topics
					</p>
				</div>

				{authUser && isOwner && (
					<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
						<p className="text-base font-medium text-gray-900 group-hover:text-blue-600">
							{followedQuestionsCount} Followed Questions
						</p>
					</div>
				)}

				{/* bonus empty cell to make it a complete row of 6 */}
				<div></div>
			</div>
		</section>
	);
}
