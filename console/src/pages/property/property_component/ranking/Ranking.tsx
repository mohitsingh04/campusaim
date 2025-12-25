import { useCallback, useEffect, useState } from "react";
import { CategoryProps, PropertyProps } from "../../../../types/types";
import RankingCreate from "./RankingCreate";
import RankingEdit from "./RankingEdit";
import { API } from "../../../../contexts/API";
import { Edit, Trash2 } from "lucide-react";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import ActionDropdown from "../../../../common/ActionDropdown";

export default function Ranking({
	property,
}: {
	property: PropertyProps | null;
}) {
	const [ranking, setRanking] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [isEdit, setIsEdit] = useState<any>("");
	const [categories, setCategories] = useState<CategoryProps[]>([]);

	const fetchCategories = useCallback(async () => {
		try {
			const res = await API.get("/category");
			setCategories(res?.data || []);
		} catch (error) {
			getErrorResponse(error, true);
		}
	}, []);

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	const getRanking = useCallback(async () => {
		if (!property?._id) {
			setLoading(false);
			return;
		}
		try {
			const response = await API.get(`/ranking/${property?._id}`);
			if (response.data && response.data.length > 0) {
				setRanking(response.data);
			} else {
				setRanking([]);
			}
		} catch (error) {
			getErrorResponse(error, true);
			setRanking([]);
		} finally {
			setLoading(false);
		}
	}, [property?._id]);

	useEffect(() => {
		getRanking();
	}, [getRanking]);

	const getCategoryById = (id: string) => {
		const cat = categories.find((c: any) => c._id === id)?.category_name;
		return cat || id;
	};

	if (loading) {
		return (
			<div className="text-gray-700 dark:text-gray-200 p-4">Loading...</div>
		);
	}

	if (ranking.length === 0) {
		return <RankingCreate property={property} getRanking={getRanking} />;
	}

	if (isEdit) {
		return (
			<RankingEdit
				property={property}
				ranking={isEdit}
				getRanking={getRanking}
				setIsEdit={setIsEdit}
			/>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-6">
			{ranking?.map((acc) => {
				return (
					<div key={acc?._id || Math.random()} className="flex flex-col">
						<div className="flex items-center justify-between px-4 py-3 border-b border-[var(--yp-border-primary)]">
							<h3 className="text-lg font-semibold text-[var(--yp-text-primary)]">
								Ranking Details
							</h3>

							<div className="flex gap-2">
								<ActionDropdown>
									<ul className="py-2 text-xs text-[var(--yp-text-primary)]">
										<li>
											<button
												onClick={() => setIsEdit(acc)}
												className="w-full flex items-center gap-2 px-2 py-1 text-sm"
											>
												<Edit className="w-4 h-4 text-blue-500" />
												Edit Rank
											</button>
										</li>
										<li>
											<button
												onClick={() => {
													// delete logic
												}}
												className="w-full flex items-center gap-2 px-2 py-1 text-sm"
											>
												<Trash2 className="w-4 h-4 text-red-500" />
												Delete
											</button>
										</li>
									</ul>
								</ActionDropdown>
							</div>
						</div>
						{/* Card Body */}
						<div className="px-4 py-3 flex-1 space-y-3">
							<h4 className="text-sm font-semibold text-[var(--yp-text-primary)]">
								NAAC Ranking
							</h4>
							{getCategoryById(acc?.naac_rank || "N/A")}
						</div>
						<div className="px-4 py-3 flex-1 space-y-3">
							<h4 className="text-sm font-semibold text-[var(--yp-text-primary)]">
								NIRF Ranking
							</h4>
							{acc?.nirf_rank}
						</div>
						<div className="px-4 py-3 flex-1 space-y-3">
							<h4 className="text-sm font-semibold text-[var(--yp-text-primary)]">
								NBA Ranking
							</h4>
							{acc?.nba_rank}
						</div>
						<div className="px-4 py-3 flex-1 space-y-3">
							<h4 className="text-sm font-semibold text-[var(--yp-text-primary)]">
								QS World University Ranking
							</h4>
							{acc?.qs_rank}
						</div>
						<div className="px-4 py-3 flex-1 space-y-3">
							<h4 className="text-sm font-semibold text-[var(--yp-text-primary)]">
								THE (Times Higher Education) Ranking
							</h4>
							{acc?.times_higher_education_rank}
						</div>
					</div>
				);
			})}
		</div>
	);
}
