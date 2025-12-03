import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useMemo, useState } from "react";
import JoditEditor from "jodit-react";
import { API } from "../../../../contexts/API";
import { PropertyProps } from "../../../../types/types";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import { getEditorConfig } from "../../../../contexts/JoditEditorConfig";

export default function AdmissionProcessEdit({
	property,
	admission_process,
	getAdmissionProcess,
	setIsEdit,
}: {
	property: PropertyProps | null;
	admission_process: any;
	getAdmissionProcess: () => void;
	setIsEdit: any;
}) {
	const editorConfig = useMemo(() => getEditorConfig(), []);
	const [editorContent, setEditorContent] = useState(
		admission_process?.admission_process || ""
	);

	const formik = useFormik({
		initialValues: {
			property_id: property?._id || "",
			admission_process: admission_process?.admission_process || "",
		},
		enableReinitialize: true,
		onSubmit: async (values, { setSubmitting }) => {
			setSubmitting(true);
			try {
				const payload = {
					...values,
					admission_process: editorContent || "",
				};

				const response = await API.patch(
					`/admission_process/${admission_process?._id}`,
					payload
				);

				toast.success(
					response.data.message || "Admission Process Updated Successfully"
				);
				getAdmissionProcess();
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
					{/* Admission Process */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							Admission Process
						</label>
						<JoditEditor
							value={editorContent || ""}
							onChange={(newContent) => setEditorContent(newContent || "")}
							config={editorConfig}
						/>
					</div>

					{/* Submit */}
					<div className="flex justify-start">
						<button
							type="submit"
							disabled={formik.isSubmitting}
							className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
						>
							Update
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
