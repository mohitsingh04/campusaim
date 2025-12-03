import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import { useMemo, useState } from "react";
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

export default function AdmissionProcessCreate({
	property,
	getAdmissionProcess,
}: {
	property: PropertyProps | null;
	getAdmissionProcess: () => void;
}) {
	const [editorContent, setEditorContent] = useState("");
	const editorConfig = useMemo(() => getEditorConfig(), []);
	const { authUser } = useOutletContext<DashboardOutletContextProps>();

	const formik = useFormik({
		initialValues: {
			property_id: property?._id || "",
			userId: authUser?._id || "",
			admission_process: "",
		},
		enableReinitialize: true,
		onSubmit: async (values, { setSubmitting }) => {
			setSubmitting(true);
			try {
				const payload = {
					...values,
					admission_process: editorContent || "",
				};

				const response = await API.post("/admission_process", payload);
				toast.success(
					response.data.message || "Admission Process Created Successfully"
				);
				getAdmissionProcess();
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
							config={editorConfig}
							onChange={(newContent) => setEditorContent(newContent || "")}
						/>
						{getFormikError(formik, "admission_process")}
					</div>

					{/* Submit */}
					<div className="flex justify-start">
						<button
							type="submit"
							disabled={formik.isSubmitting}
							className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
						>
							Submit
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
