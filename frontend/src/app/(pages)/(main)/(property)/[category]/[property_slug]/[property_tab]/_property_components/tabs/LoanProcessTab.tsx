import React from "react";
import ReadMoreLess from "@/components/read-more/ReadMoreLess";
import { LoanProcessProps } from "@/types/types";

export default function LoanProcessTab({
	loanProcess,
}: {
	loanProcess: LoanProcessProps[];
}) {
	return (
		<div className="space-y-6 p-6">
			<div className="space-y-8 max-w-5xl mx-auto">
				{loanProcess && (
					<ReadMoreLess htmlText={loanProcess[0]?.loan_process} />
				)}
			</div>
		</div>
	);
}
