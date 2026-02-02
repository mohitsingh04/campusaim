import React from "react";
import HeadingLine from "@/ui/headings/HeadingLine";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";

export default function LoanProcessTab({
	loanProcess,
	property_short_name,
}: {
	loanProcess: any;
	property_short_name: any;
}) {
	return (
		<div className="space-y-3">
			<div className="space-y-6 max-w-6xl mx-auto">
				<div className="p-5 shadow-custom transition">
					<HeadingLine title={`${property_short_name} Loan Process`} />
					<ReadMoreLess html={loanProcess[0]?.loan_process} />
				</div>
			</div>
		</div>
	);
}
