import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import JoditEditor from "jodit-react";
import { getEditorConfig } from "../../contexts/JoditEditorConfig";
import { API } from "../../contexts/API";
import { useFormik } from "formik";
import {
	getCategoryAccodingToField,
	getErrorResponse,
	getFormikError,
} from "../../contexts/Callbacks";
import { CategoryProps } from "../../types/types";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { ScholarshipValidation } from "../../contexts/ValidationsSchemas";

export function AddScholarship() {
	const editor = useRef(null);
	const redirector = useNavigate();
	const editorConfig = useMemo(() => getEditorConfig(), []);
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
			scholarship_title: "",
			scholarship_type: "",
			scholarship_description: "",
		},
		validationSchema: ScholarshipValidation,
		onSubmit: async (values, { setSubmitting }) => {
			setSubmitting(true);
			try {
				const response = await API.post("/scholarship", values);
				toast.success(
					response.data.message || "Scholarship created Successfully"
				);
				redirector(`/dashboard/scholarship`);
			} catch (error) {
				getErrorResponse(error);
			} finally {
				setSubmitting(false);
			}
		},
	});

	const ScholarshipTypeOptions = getCategoryAccodingToField(
		categories,
		"scholarship type"
	);

	return (
		<div>
			<Breadcrumbs
				title="Create Scholarship"
				breadcrumbs={[
					{ label: "Dashboard", path: "/dashboard" },
					{ label: "Scholarships", path: "/dashboard/scholarship" },
					{ label: "Create" },
				]}
			/>
			<div className="bg-[var(--yp-primary)] rounded-xl shadow-sm">
				<form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Scholarship Title */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Scholarship Title
							</label>
							<input
								type="text"
								name="scholarship_title"
								value={formik.values.scholarship_title}
								onChange={formik.handleChange}
								placeholder="Enter Scholarship Title"
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							{getFormikError(formik, "scholarship_title")}
						</div>

						{/* Scholarship Type */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Scholarship Type
							</label>
							<select
								name="scholarship_type"
								value={formik.values.scholarship_type}
								onChange={formik.handleChange}
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							>
								<option value="">Select Mode</option>
								{ScholarshipTypeOptions.map((opt: any, idx: number) => (
									<option key={idx} value={opt._id}>
										{opt.category_name || opt.name}
									</option>
								))}
							</select>
							{getFormikError(formik, "scholarship_type")}
						</div>
					</div>

					{/* Description */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							Description
						</label>
						<JoditEditor
							ref={editor}
							value={formik.values.scholarship_description}
							config={editorConfig}
							onBlur={(newContent) =>
								formik.setFieldValue("scholarship_description", newContent)
							}
						/>
						{getFormikError(formik, "scholarship_description")}
					</div>

					<div className="flex justify-start">
						<button
							type="submit"
							className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
							disabled={formik.isSubmitting}
						>
							{formik?.isSubmitting ? "Creating..." : "Create"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
