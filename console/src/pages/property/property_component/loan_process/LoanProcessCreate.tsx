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

export default function LoanProcessCreate({
	property,
	getLoanProcess,
}: {
	property: PropertyProps | null;
	getLoanProcess: () => void;
}) {
	const [editorContent, setEditorContent] = useState("");
	const editorConfig = useMemo(() => getEditorConfig(), []);
	const { authUser } = useOutletContext<DashboardOutletContextProps>();

	const formik = useFormik({
		initialValues: {
			property_id: property?._id || "",
			userId: authUser?._id || "",
			loan_process: "",
		},
		enableReinitialize: true,
		onSubmit: async (values, { setSubmitting }) => {
			setSubmitting(true);
			try {
				const payload = {
					...values,
					loan_process: editorContent || "",
				};

				const response = await API.post("/loan_process", payload);
				toast.success(
					response.data.message || "Loan Process Created Successfully"
				);
				getLoanProcess();
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
					{/* Loan Process */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							Loan Process
						</label>
						<JoditEditor
							value={editorContent || ""}
							config={editorConfig}
							onChange={(newContent) => setEditorContent(newContent || "")}
						/>
						{getFormikError(formik, "loan_process")}
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
