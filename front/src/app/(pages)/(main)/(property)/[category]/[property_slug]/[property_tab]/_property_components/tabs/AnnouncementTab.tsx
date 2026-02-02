import React from "react";
import HeadingLine from "@/ui/headings/HeadingLine";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";

export default function AnnouncementTab({
	announcement,
	property_short_name,
}: {
	announcement: any;
	property_short_name: any;
}) {
	return (
		<div className="space-y-3">
			<div className="space-y-6 max-w-6xl mx-auto">
				<div className="p-5 shadow-custom transition">
					<HeadingLine title={`${property_short_name} Announcements`} />
					<ReadMoreLess html={announcement[0]?.announcement} />
				</div>
			</div>
		</div>
	);
}
