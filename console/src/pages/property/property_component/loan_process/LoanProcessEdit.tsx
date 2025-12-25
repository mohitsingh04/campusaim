import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useMemo, useState } from "react";
import JoditEditor from "jodit-react";
import { API } from "../../../../contexts/API";
import { PropertyProps } from "../../../../types/types";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import { getEditorConfig } from "../../../../contexts/JoditEditorConfig";

export default function LoanProcessEdit({
	property,
	loan_process,
	getLoanProcess,
	setIsEdit,
}: {
	property: PropertyProps | null;
	loan_process: any;
	getLoanProcess: () => void;
	setIsEdit: any;
}) {
	const editorConfig = useMemo(() => getEditorConfig(), []);
	const [editorContent, setEditorContent] = useState(
		loan_process?.loan_process || ""
	);

	const formik = useFormik({
		initialValues: {
			property_id: property?._id || "",
			loan_process: loan_process?.loan_process || "",
		},
		enableReinitialize: true,
		onSubmit: async (values, { setSubmitting }) => {
			setSubmitting(true);
			try {
				const payload = {
					...values,
					loan_process: editorContent || "",
				};

				const response = await API.patch(
					`/loan_process/${loan_process?._id}`,
					payload
				);

				toast.success(
					response.data.message || "Loan Process Updated Successfully"
				);
				getLoanProcess();
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
					{/* Loan Process */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							Loan Process
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
