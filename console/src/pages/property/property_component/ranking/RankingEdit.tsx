import { useFormik } from "formik";
import toast from "react-hot-toast";
import { API } from "../../../../contexts/API";
import { CategoryProps, PropertyProps } from "../../../../types/types";
import {
	getCategoryAccodingToField,
	getErrorResponse,
	getFormikError,
} from "../../../../contexts/Callbacks";
import Select from "react-select";
import { useCallback, useEffect, useState } from "react";

export default function RankingEdit({
	property,
	ranking,
	getRanking,
	setIsEdit,
}: {
	property: PropertyProps | null;
	ranking: any;
	getRanking: () => void;
	setIsEdit: any;
}) {
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

	const formik = useFormik({
		initialValues: {
			property_id: property?._id || "",
			naac_rank: ranking?.naac_rank || "",
			nirf_rank: ranking?.nirf_rank || "",
			nba_rank: ranking?.nba_rank || "",
			qs_rank: ranking?.qs_rank || "",
			times_higher_education_rank: ranking?.times_higher_education_rank || "",
		},
		enableReinitialize: true,
		onSubmit: async (values, { setSubmitting }) => {
			setSubmitting(true);
			try {
				const payload: Record<string, any> = {};
				if (typeof values.property_id !== "undefined")
					payload.property_id = values.property_id;
				if (typeof values.naac_rank !== "undefined")
					payload.naac_rank = values.naac_rank || "";
				if (typeof values.nirf_rank !== "undefined")
					payload.nirf_rank = values.nirf_rank || "";
				if (typeof values.nba_rank !== "undefined")
					payload.nba_rank = values.nba_rank || "";
				if (typeof values.qs_rank !== "undefined")
					payload.qs_rank = values.qs_rank || "";
				if (typeof values.times_higher_education_rank !== "undefined")
					payload.times_higher_education_rank =
						values.times_higher_education_rank || "";

				const response = await API.patch(`/ranking/${ranking?._id}`, payload);

				toast.success(response.data.message || "Ranking Updated Successfully");
				await getRanking();
				setIsEdit("");
			} catch (error) {
				getErrorResponse(error);
				toast.error("Failed to update ranking.");
			} finally {
				setSubmitting(false);
			}
		},
	});
	const naacRankOptions = getCategoryAccodingToField(categories, "Naac Rank");
	const naacRankSelectOptions = naacRankOptions.map((opt: any) => ({
		value: opt._id,
		label: opt.category_name || opt.name,
	}));

	return (
		<div className="space-y-6">
			<div>
				<form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
					{/* NAAC Ranking */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							NAAC Ranking
						</label>

						<Select
							name="naac_rank"
							options={naacRankSelectOptions}
							value={naacRankSelectOptions.find(
								(opt) => opt.value === formik.values.naac_rank
							)}
							onChange={(selected) =>
								formik.setFieldValue(
									"naac_rank",
									selected ? selected.value : ""
								)
							}
							onBlur={() => formik.setFieldTouched("naac_rank", true)}
							classNamePrefix="react-select"
						/>
					</div>

					<div className="grid grid-cols-2 gap-2">
						{/* NIRF Ranking */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								NIRF Ranking
							</label>
							<input
								type="text"
								name="nirf_rank"
								value={formik.values.nirf_rank}
								onChange={formik.handleChange}
								placeholder="Enter NIRF Rank"
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
						</div>

						{/* NBA Ranking */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								NBA Ranking
							</label>
							<input
								type="text"
								name="nba_rank"
								value={formik.values.nba_rank}
								onChange={formik.handleChange}
								placeholder="Enter NBA Rank"
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
						</div>
					</div>

					{/* International Rankings */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							International Rankings
						</label>
						<div className="grid grid-cols-2 gap-2">
							<div>
								<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
									QS World University Ranking
								</label>
								<input
									type="text"
									name="qs_rank"
									value={formik.values.qs_rank}
									onChange={formik.handleChange}
									placeholder="Enter QS World University Ranking"
									className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
								/>
								{getFormikError(formik, "qs_rank")}
							</div>
							<div>
								<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
									THE (Times Higher Education) Ranking
								</label>
								<input
									type="text"
									name="times_higher_education_rank"
									value={formik.values.times_higher_education_rank}
									onChange={formik.handleChange}
									placeholder="Enter THE (Times Higher Education) Ranking"
									className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
								/>
								{getFormikError(formik, "times_higher_education_rank")}
							</div>
						</div>
					</div>

					{/* Submit */}
					<div className="flex justify-start">
						<button
							type="submit"
							disabled={formik.isSubmitting}
							className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
						>
							{formik.isSubmitting ? "Updating..." : "Update"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
