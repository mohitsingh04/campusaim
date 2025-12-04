import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import { useMemo } from "react";
import JoditEditor from "jodit-react";
import { API } from "../../../../contexts/API";
import {
	DashboardOutletContextProps,
	PropertyProps,
} from "../../../../types/types";
import {
	getErrorResponse,
	getFormikError,
} from "../../../../contexts/Callbacks";
import { getEditorConfig } from "../../../../contexts/JoditEditorConfig";

export default function RankingCreate({
	property,
	getRanking,
}: {
	property: PropertyProps | null;
	getRanking: () => void;
}) {
	const editorConfig = useMemo(() => getEditorConfig(), []);
	const { authUser } = useOutletContext<DashboardOutletContextProps>();

	const formik = useFormik({
		initialValues: {
			property_id: property?._id || "",
			userId: authUser?._id || "",
			naac_rank: "",
			nirf_rank: "",
			nba_rank: "",
			other_ranking: "",
		},
		enableReinitialize: true,
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			setSubmitting(true);
			try {
				const payload = {
					property_id: values.property_id,
					userId: values.userId,
					naac_rank: values.naac_rank || "",
					nirf_rank: values.nirf_rank || "",
					nba_rank: values.nba_rank || "",
					other_ranking: values.other_ranking || "",
				};

				const response = await API.post("/ranking", payload);
				toast.success(response.data.message || "Ranking Created Successfully");
				getRanking();
				// optionally clear editors
				resetForm({
					values: {
						property_id: values.property_id,
						userId: values.userId,
						naac_rank: "",
						nirf_rank: "",
						nba_rank: "",
						other_ranking: "",
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

	return (
		<div className="space-y-6">
			<div>
				<form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
					{/* NAAC Ranking */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							NAAC
						</label>
						<JoditEditor
							value={formik.values.naac_rank || ""}
							config={editorConfig}
							onChange={(newContent) =>
								formik.setFieldValue("naac_rank", newContent || "")
							}
						/>
						{getFormikError(formik, "naac_rank")}
					</div>

					{/* NIRF Ranking */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							NIRF
						</label>
						<JoditEditor
							value={formik.values.nirf_rank || ""}
							config={editorConfig}
							onChange={(newContent) =>
								formik.setFieldValue("nirf_rank", newContent || "")
							}
						/>
						{getFormikError(formik, "nirf_rank")}
					</div>

					{/* NBA Ranking */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							NBA
						</label>
						<JoditEditor
							value={formik.values.nba_rank || ""}
							config={editorConfig}
							onChange={(newContent) =>
								formik.setFieldValue("nba_rank", newContent || "")
							}
						/>
						{getFormikError(formik, "nba_rank")}
					</div>

					{/* Other Ranking */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							Other Ranking
						</label>
						<JoditEditor
							value={formik.values.other_ranking || ""}
							config={editorConfig}
							onChange={(newContent) =>
								formik.setFieldValue("other_ranking", newContent || "")
							}
						/>
						{getFormikError(formik, "other_ranking")}
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
