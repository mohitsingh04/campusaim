import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { API } from "../../../../contexts/API";
import {
	CategoryProps,
	DashboardOutletContextProps,
	PropertyProps,
} from "../../../../types/types";
import {
	getCategoryAccodingToField,
	getErrorResponse,
	getFormikError,
} from "../../../../contexts/Callbacks";
import Select from "react-select";
import { PropertyRankingValidation } from "../../../../contexts/ValidationsSchemas";

export default function RankingCreate({
	property,
	getRanking,
}: {
	property: PropertyProps | null;
	getRanking: () => void;
}) {
	const { authUser } = useOutletContext<DashboardOutletContextProps>();
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
			userId: authUser?._id || "",
			naac_rank: "",
			nirf_rank: "",
			nba_rank: "",
			qs_rank: "",
			times_higher_education_rank: "",
		},
		validationSchema: PropertyRankingValidation,
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			setSubmitting(true);
			try {
				const payload = {
					property_id: values.property_id,
					userId: values.userId,
					naac_rank: values.naac_rank || "",
					nirf_rank: values.nirf_rank || "",
					nba_rank: values.nba_rank || "",
					qs_rank: values.qs_rank || "",
					times_higher_education_rank: values.times_higher_education_rank || "",
				};

				const response = await API.post("/ranking", payload);
				toast.success(response.data.message || "Ranking Added Successfully");
				getRanking();
				// optionally clear editors
				resetForm({
					values: {
						property_id: values.property_id,
						userId: values.userId,
						naac_rank: "",
						nirf_rank: "",
						nba_rank: "",
						qs_rank: "",
						times_higher_education_rank: "",
					},
				});
			} catch (error) {
				// consistent error toast and callback
				getErrorResponse(error);
				toast.error("Failed to create ranking.");
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

						{getFormikError(formik, "naac_rank")}
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
							{getFormikError(formik, "nirf_rank")}
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
							{getFormikError(formik, "nba_rank")}
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
							{formik.isSubmitting ? "Submitting..." : "Submit"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
