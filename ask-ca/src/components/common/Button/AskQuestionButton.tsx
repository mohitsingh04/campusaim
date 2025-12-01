"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";

export default function AskQuestionButton() {
	return (
		<div className="fixed bottom-20 right-4 z-[999] sm:hidden">
			<Link
				href="/question/ask"
				className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
				aria-label="Ask a Question"
			>
				<PenLine className="w-6 h-6" />
			</Link>
		</div>
	);
}
