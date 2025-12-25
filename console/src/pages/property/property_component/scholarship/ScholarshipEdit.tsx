import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useMemo, useState } from "react";
import JoditEditor from "jodit-react";
import { API } from "../../../../contexts/API";
import { PropertyProps } from "../../../../types/types";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import { getEditorConfig } from "../../../../contexts/JoditEditorConfig";

export default function ScholarshipEdit({
	property,
	scholarship,
	getScholarship,
	setIsEdit,
}: {
	property: PropertyProps | null;
	scholarship: any;
	getScholarship: () => void;
	setIsEdit: any;
}) {
	const editorConfig = useMemo(() => getEditorConfig(), []);
	const [editorContent, setEditorContent] = useState(
		scholarship?.scholarship || ""
	);

	const formik = useFormik({
		initialValues: {
			property_id: property?._id || "",
			scholarship: scholarship?.scholarship || "",
		},
		enableReinitialize: true,
		onSubmit: async (values, { setSubmitting }) => {
			setSubmitting(true);
			try {
				const payload = {
					...values,
					scholarship: editorContent || "",
				};

				const response = await API.patch(
					`/property-scholarship/${scholarship?._id}`,
					payload
				);

				toast.success(
					response.data.message || "Scholarship Updated Successfully"
				);
				getScholarship();
				setIsEdit("");
			} catch (error) {
				getErrorResponse(error);
			} finally {
				setSubmitting(false);
			}
		},
	});

	return (
		<div className="space-y-6">
			<div>
				<form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
					{/* Scholarship */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							Scholarship
						</label>
						<JoditEditor
							value={editorContent || ""}
							onChange={(newContent) => setEditorContent(newContent || "")}
							config={editorConfig}
						/>
					</div>

					{/* Submit */}
					<button
						type="submit"
						disabled={formik.isSubmitting}
						className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
					>
						{formik.isSubmitting ? "Updating..." : "Update"}
					</button>
					<button
						type="button"
						onClick={() => setIsEdit("")}
						className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)] ms-2"
					>
						Cancel
					</button>
				</form>
			</div>
		</div>
	);
}
