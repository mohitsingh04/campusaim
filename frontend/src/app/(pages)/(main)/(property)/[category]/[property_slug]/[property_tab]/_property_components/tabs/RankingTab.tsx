
export default function RankingTab({
	ranking,
	getCategoryById,
}: {
	ranking: any;
	getCategoryById: (id: string) => string | null;
}) {
	if (!ranking) {
		return <div className="p-6 text-gray-500">No ranking data available</div>;
	}

	return (
		<div className="space-y-6 p-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="bg-purple-50 rounded-xl p-5 shadow-xs">
					NAAC Ranking: {getCategoryById(ranking[0].naac_rank) ?? "N/A"}
				</div>

				<div className="bg-purple-50 rounded-xl p-5 shadow-xs">
					NIRF Ranking: {ranking[0].nirf_rank ?? "N/A"}
				</div>

				<div className="bg-purple-50 rounded-xl p-5 shadow-xs">
					NBA Ranking: {ranking[0].nba_rank ?? "N/A"}
				</div>

				<div className="bg-purple-50 rounded-xl p-5 shadow-xs">
					QS World University Ranking: {ranking[0].qs_rank ?? "N/A"}
				</div>

				<div className="bg-purple-50 rounded-xl p-5 shadow-xs">
					THE Ranking: {ranking[0].times_higher_education_rank ?? "N/A"}
				</div>
			</div>
		</div>
	);
}
