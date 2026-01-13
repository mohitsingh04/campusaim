import React from "react";
import ReadMoreLess from "@/components/read-more/ReadMoreLess";
import { AnnouncementProps } from "@/types/types";

export default function AnnouncementTab({
	announcements,
}: {
	announcements: AnnouncementProps[];
}) {
	return (
		<div className="space-y-6 p-6">
			<div className="space-y-8 max-w-5xl mx-auto">
				{announcements && (
					<ReadMoreLess htmlText={announcements[0]?.announcement} />
				)}
			</div>
		</div>
	);
}
