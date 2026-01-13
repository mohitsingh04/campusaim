import React from "react";
import ReadMoreLess from "@/components/read-more/ReadMoreLess";
import { ScholarshipProps } from "@/types/types";

export default function ScholarshipTab({
	scholarship,
}: {
	scholarship: ScholarshipProps[];
}) {
	return (
		<div className="space-y-6 p-6">
			<div className="space-y-8 max-w-5xl mx-auto">
				{scholarship && <ReadMoreLess htmlText={scholarship[0]?.scholarship} />}
			</div>
		</div>
	);
}
