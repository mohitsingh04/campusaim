import HeadingLine from "@/ui/headings/HeadingLine";
import React from "react";

export default function RankingTab({
	ranking,
	property_short_name,
	getCategoryById,
}: {
	ranking: any;
	property_short_name: any;
	getCategoryById: any;
}) {
	return (
		<div className="space-y-6 p-5 text-(--text-color)">
			<HeadingLine title={`${property_short_name} Ranking`} />

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="bg-(--secondary-bg) shadow-custom rounded-custom p-5">
					<p>NAAC Rank: {getCategoryById(ranking[0]?.naac_rank)}</p>
					<p>NIRF Rank: {ranking[0]?.nirf_rank}</p>
					<p>NBA Rank: {ranking[0]?.nba_rank}</p>
				</div>

				<div className="bg-(--secondary-bg) shadow-custom rounded-custom p-5">
					<p>QS World University Rank: {ranking[0]?.qs_rank}</p>
					<p>
						THE (Times Higher Education) Rank:{" "}
						{ranking[0]?.times_higher_education_rank}
					</p>
				</div>
			</div>
		</div>
	);
}
