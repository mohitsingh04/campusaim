import React from "react";
import { User, Question, Answer } from "@/config/Types";
import Link from "next/link";

interface AnswerTabProps {
	questionList: Question[];
	user: User | null;
	answerList: Answer[];
	question?: string;
	rawQuestions: Question[];
}

export default function AnswerTab({
	answerList,
	rawQuestions,
}: AnswerTabProps) {
	const getQuestionById = (questionId: string) => {
		return rawQuestions.find((q) => q._id === questionId);
	};

	return (
		<section className="w-full">
			<header className="mb-4">
				<h2 className="text-xl font-semibold text-gray-800">
					{answerList.length} {answerList.length === 1 ? "Answer" : "Answers"}
				</h2>
				<hr className="mt-2 border-gray-200" />
			</header>

			{answerList.length === 0 ? (
				<p className="text-sm text-gray-500">No answers yet.</p>
			) : (
				<ul className="space-y-3">
					{answerList.map((ans) => {
						if (!ans.question) return null;

						// Support if ans.question is object or string
						const questionId =
							typeof ans.question === "string"
								? ans.question
								: ans.question._id;

						const question = getQuestionById(questionId);
						if (!question) return null;

						const allAnswersForQuestion = answerList.filter((a) => {
							const qId =
								typeof a.question === "string" ? a.question : a.question?._id;
							return qId === questionId;
						});

						return (
							<li
								key={ans._id}
								className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
							>
								<Link
									href={`/question/${question.slug}`}
									className="group block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
									aria-label={`Open question: ${question.title}`}
									target="_blank"
								>
									<p className="text-base font-medium text-gray-900 group-hover:text-blue-600">
										{question.title}
									</p>
								</Link>

								<div>
									<p
										className="mt-1 text-sm text-gray-600 line-clamp-3"
										dangerouslySetInnerHTML={{
											__html: ans.content || "",
										}}
									/>
								</div>

								<div className="mt-1 flex flex-wrap gap-2">
									<span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
										{allAnswersForQuestion.length}{" "}
										{allAnswersForQuestion.length === 1 ? "Answer" : "Answers"}
									</span>

									<span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
										{ans.createdAt && (
											<div className="">
												<span>
													<time dateTime={new Date(ans.createdAt).toISOString()}>
														{new Date(ans.createdAt).toLocaleDateString("en-US", {
															year: "numeric",
															month: "short",
															day: "numeric",
														})}
													</time>
												</span>
											</div>
										)}
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
