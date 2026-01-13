import React from "react";
import ReadMoreLess from "@/components/read-more/ReadMoreLess";
import { AdmissionProcessProps } from "@/types/types";

export default function AdmissionProcessTab({
	admissionProcess,
}: {
	admissionProcess: AdmissionProcessProps[];
}) {
	return (
		<div className="space-y-6 p-6">
			<div className="space-y-8 max-w-5xl mx-auto">
				{admissionProcess && (
					<ReadMoreLess htmlText={admissionProcess[0]?.admission_process} />
				)}
			</div>
		</div>
	);
}
