import React, {
	useState,
	useRef,
	useMemo,
	useEffect,
	useCallback,
} from "react";
import { Image } from "lucide-react";
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
import { CourseValidation } from "../../contexts/ValidationsSchemas";
import Select from "react-select";

export function CourseCreate() {
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
			course_name: "",
			course_short_name: "",
			specialization: "",
			duration_value: "",
			duration_type: "",
			course_type: "",
			program_type: "",
			best_for: [] as string[],
			course_eligibility: "",
			image: null as File | null,
			description: "",
		},
		validationSchema: CourseValidation,
		onSubmit: async (values, { setSubmitting }) => {
			setSubmitting(true);
			try {
				const fd = new FormData();
				fd.append("course_name", values.course_name);
				fd.append("course_short_name", values.course_short_name);
				fd.append("specialization", values.specialization);
				fd.append(
					"duration",
					`${values?.duration_value} ${values?.duration_type}`
				);
				fd.append("course_type", values.course_type);
				fd.append("program_type", values.program_type);
				fd.append("best_for", JSON.stringify(values.best_for));
				if (values.image) {
					fd.append("image", values.image);
				}
				fd.append("course_eligibility", values.course_eligibility);
				fd.append("description", values.description);

				const response = await API.post("/course", fd);
				toast.success(response.data.message || "Course created Successfully");
				redirector(`/dashboard/course`);
			} catch (error) {
				getErrorResponse(error);
			} finally {
				setSubmitting(false);
			}
		},
	});

	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] ?? null;
		formik.setFieldValue("image", file);
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => setPreviewImage(reader.result as string);
			reader.readAsDataURL(file);
		} else {
			setPreviewImage(null);
		}
	};

	const specializationOptions = getCategoryAccodingToField(
		categories,
		"specialization"
	);
	const bestForOptions = getCategoryAccodingToField(categories, "Best For");
	const bestForSelectOptions = bestForOptions.map((opt: any) => ({
		value: opt._id,
		label: opt.category_name || opt.name,
	}));
	const courseTypeOptions = getCategoryAccodingToField(
		categories,
		"Course Type"
	);
	const courseTypeSelectOptions = courseTypeOptions.map((opt: any) => ({
		value: opt._id,
		label: opt.category_name || opt.name,
	}));
	const ProgramTypeOptions = getCategoryAccodingToField(
		categories,
		"Program Type"
	);
	const programTypeSelectOptions = ProgramTypeOptions.map((opt: any) => ({
		value: opt._id,
		label: opt.category_name || opt.name,
	}));

	return (
		<div>
			<Breadcrumbs
				title="Create Course"
				breadcrumbs={[
					{ label: "Dashboard", path: "/dashboard" },
					{ label: "Courses", path: "/dashboard/course" },
					{ label: "Create" },
				]}
			/>
			<div className="bg-[var(--yp-primary)] rounded-xl shadow-sm">
				<form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Course Name */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Course Name
							</label>
							<input
								type="text"
								name="course_name"
								value={formik.values.course_name}
								onChange={formik.handleChange}
								placeholder="Enter Course Name"
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							{getFormikError(formik, "course_name")}
						</div>

						{/* Course Short Name */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Course Short Name
							</label>
							<input
								type="text"
								name="course_short_name"
								value={formik.values.course_short_name}
								onChange={formik.handleChange}
								placeholder="Enter Short Name"
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							{getFormikError(formik, "course_short_name")}
						</div>

						{/* Specialization */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Specialization
							</label>
							<select
								name="specialization"
								value={formik.values.specialization}
								onChange={formik.handleChange}
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							>
								<option value="">Select Specialization</option>
								{specializationOptions.map((opt: any, idx: number) => (
									<option key={idx} value={opt._id}>
										{opt.category_name || opt.name}
									</option>
								))}
							</select>
							{getFormikError(formik, "specialization")}
						</div>

						{/* Duration Value */}
						<div className="grid grid-cols-2 gap-2">
							<div>
								<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
									Duration Value
								</label>
								<input
									type="number"
									name="duration_value"
									value={formik.values.duration_value}
									onChange={formik.handleChange}
									placeholder="Enter Duration"
									className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
								/>
								{getFormikError(formik, "duration_value")}
							</div>
							<div>
								<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
									Duration Type
								</label>
								<select
									name="duration_type"
									value={formik.values.duration_type}
									onChange={formik.handleChange}
									className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
								>
									<option value="">Select Type</option>
									<option value="months">Months</option>
									<option value="years">Years</option>
								</select>
								{getFormikError(formik, "duration_type")}
							</div>
						</div>

						{/* Course Type */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Course Type
							</label>

							<Select
								name="course_type"
								options={courseTypeSelectOptions}
								value={courseTypeSelectOptions.find(
									(opt) => opt.value === formik.values.course_type
								)}
								onChange={(selected) =>
									formik.setFieldValue(
										"course_type",
										selected ? selected.value : ""
									)
								}
								onBlur={() => formik.setFieldTouched("course_type", true)}
								classNamePrefix="react-select"
							/>

							{getFormikError(formik, "course_type")}
						</div>

						{/* Program Type */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Program Type
							</label>

							<Select
								name="program_type"
								options={programTypeSelectOptions}
								value={programTypeSelectOptions.find(
									(opt) => opt.value === formik.values.program_type
								)}
								onChange={(selected) =>
									formik.setFieldValue(
										"program_type",
										selected ? selected.value : ""
									)
								}
								onBlur={() => formik.setFieldTouched("program_type", true)}
								classNamePrefix="react-select"
							/>

							{getFormikError(formik, "program_type")}
						</div>

						{/* Best For */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Best For
							</label>

							<Select
								isMulti
								name="best_for"
								options={bestForSelectOptions}
								value={bestForSelectOptions.filter((opt) =>
									formik.values.best_for?.includes(opt.value)
								)}
								onChange={(selected) =>
									formik.setFieldValue(
										"best_for",
										Array.isArray(selected) ? selected.map((s) => s.value) : []
									)
								}
								onBlur={() => formik.setFieldTouched("best_for", true)}
								classNamePrefix="react-select"
							/>

							{getFormikError(formik, "best_for")}
						</div>
					</div>

					{/* Course Eligibility */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							Course Eligibility
						</label>
						<textarea
							name="course_eligibility"
							value={formik.values.course_eligibility}
							onChange={formik.handleChange}
							placeholder="Enter Course Eligibility"
							className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
						></textarea>
						{getFormikError(formik, "course_eligibility")}
					</div>

					{/* Image */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							Image
						</label>
						<div className="border-2 border-dashed border-[var(--yp-border-primary)] rounded-lg p-4 text-center hover:border-[var(--yp-muted)] bg-[var(--yp-input-primary)] transition-colors">
							<input
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								className="hidden"
								id="course-image"
							/>
							<label htmlFor="course-image" className="cursor-pointer block">
								{previewImage ? (
									<img
										src={previewImage}
										alt="Preview"
										className="mx-auto mb-2 max-h-40 rounded"
									/>
								) : (
									<>
										<Image className="w-8 h-8 text-[var(--yp-muted)] mx-auto mb-2" />
										<p className="text-sm text-[var(--yp-muted)]">
											{formik.values.image
												? (formik.values.image as File).name
												: "Click to upload image"}
										</p>
									</>
								)}
							</label>
						</div>
					</div>

					{/* Description */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							Description
						</label>
						<JoditEditor
							ref={editor}
							value={formik.values.description}
							config={editorConfig}
							onBlur={(newContent) =>
								formik.setFieldValue("description", newContent)
							}
						/>
						{getFormikError(formik, "description")}
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
