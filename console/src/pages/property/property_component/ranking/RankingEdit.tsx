import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useMemo } from "react";
import JoditEditor from "jodit-react";
import { API } from "../../../../contexts/API";
import { PropertyProps } from "../../../../types/types";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import { getEditorConfig } from "../../../../contexts/JoditEditorConfig";

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
	const editorConfig = useMemo(() => getEditorConfig(), []);

	const formik = useFormik({
		initialValues: {
			property_id: property?._id || "",
			naac_rank: ranking?.naac_rank || "",
			nirf_rank: ranking?.nirf_rank || "",
			nba_rank: ranking?.nba_rank || "",
			other_ranking: ranking?.other_ranking || "",
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
				if (typeof values.other_ranking !== "undefined")
					payload.other_ranking = values.other_ranking || "";

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
