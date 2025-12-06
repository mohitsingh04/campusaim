import { useMemo, useState, useEffect } from "react";
import { useFormik } from "formik";
import JoditEditor from "jodit-react";
import { API } from "../../../../contexts/API";
import { toast } from "react-hot-toast";
import { FAQProps } from "../../../../types/types";
import { getEditorConfig } from "../../../../contexts/JoditEditorConfig";
import { FaqValidation } from "../../../../contexts/ValidationsSchemas";
import { getErrorResponse } from "../../../../contexts/Callbacks";

interface EditFaqProps {
	isEdit: FAQProps;
	onEditSuccess: () => void;
	setIsEdit: any;
}

export default function EditFaq({
	isEdit,
	onEditSuccess,
	setIsEdit,
}: EditFaqProps) {
	const [answer, setAnswer] = useState(isEdit.answer || "");
	const editorConfig = useMemo(() => getEditorConfig(), []);

	const formik = useFormik({
		initialValues: {
			property_id: isEdit?.property_id || "",
			question: isEdit.question || "",
		},
		enableReinitialize: true,
		validationSchema: FaqValidation,
		onSubmit: async (values) => {
			if (!answer.trim()) {
				toast.error("Answer cannot be empty");
				return;
			}
			try {
				const res = await API.patch(`/faqs/${isEdit._id}`, {
					property_id: values.property_id,
					question: values.question,
					answer,
				});
				toast.success(res.data.message || "FAQ updated successfully");
				onEditSuccess();
			} catch (error) {
				getErrorResponse(error);
			}
		},
	});

	useEffect(() => {
		setAnswer(isEdit.answer || "");
	}, [isEdit]);

	return (
		<div className="p-4 sm:p-6">
			<form onSubmit={formik.handleSubmit}>
				{/* Question Field */}
				<div className="mb-4">
					<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
						Question
					</label>
					<input
						type="text"
						name="question"
						placeholder="Enter your question"
						value={formik.values.question}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
					/>
					{formik.touched.question && formik.errors.question && (
						<div className="text-[var(--yp-red-text)] text-sm mt-1">
							{formik.errors.question}
						</div>
					)}
				</div>

				{/* Answer Field */}
				<div className="mb-4">
					<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
						Answer
					</label>
					<JoditEditor
						value={answer}
						config={editorConfig}
						onBlur={(newContent) => setAnswer(newContent)}
					/>
				</div>

				{/* Submit Button */}
				<button
					type="submit"
					className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
				>
					Save Changes
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
	);
}
