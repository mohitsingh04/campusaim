import React from "react";
import { Question, Answer } from "@/config/Types";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface FollowedQuestionProps {
	followedQuestions: Question[];
	rawAnswers: Answer[];
}

export default function FollowedQuestion({
	followedQuestions,
	rawAnswers,
}: FollowedQuestionProps) {
	const getAnswersByQuestionId = (_id: string) => {
		if (!rawAnswers || !Array.isArray(rawAnswers)) return [];
		return rawAnswers.filter((a) => a.question === _id);
	};

	return (
		<section className="w-full">
			<header className="mb-4">
				<h2 className="text-xl font-semibold">
					{followedQuestions.length} Questions
				</h2>
				<hr className="mt-2 border-gray-200" />
			</header>

			{followedQuestions.length === 0 ? (
				<p className="text-sm text-gray-500">No questions yet.</p>
			) : (
				<ul className="space-y-3">
					{followedQuestions.map((q) => {
						const answers = getAnswersByQuestionId(q._id);
						const count = answers.length;

						// ✅ Filter out answers without updatedAt and find the latest
						const answersWithDates = answers.filter(
							(a) => a.updatedAt !== undefined
						);

						const lastAnswerDate =
							answersWithDates.length > 0
								? new Date(
										answersWithDates.reduce(
											(latest, a) =>
												new Date(a.updatedAt!).getTime() >
												new Date(latest).getTime()
													? a.updatedAt!
													: latest,
											answersWithDates[0].updatedAt!
										)
								  )
								: null;

						return (
							<li
								key={q._id}
								className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
							>
								<Link
									href={`/question/${q.slug}`}
									className="group block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
									aria-label={`Open question: ${q.title}`}
									target="_blank"
								>
									<p className="text-base font-medium text-gray-900 group-hover:text-blue-600">
										{q.title}
									</p>
								</Link>

								<div className="mt-1 flex flex-wrap gap-2">
									<span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
										{count} {count === 1 ? "Answer" : "Answers"}
									</span>

									<span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
										{lastAnswerDate
											? `Last Answered: ${formatDistanceToNow(lastAnswerDate, {
													addSuffix: true,
											  })}`
											: "No answers yet"}
									</span>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
}
