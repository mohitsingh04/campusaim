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
	getStatusAccodingToField,
} from "../../contexts/Callbacks";
import {
	CategoryProps,
	CourseProps,
	DashboardOutletContextProps,
} from "../../types/types";
import toast from "react-hot-toast";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { CourseValidation } from "../../contexts/ValidationsSchemas";
import EditSkeleton from "../../ui/skeleton/EditPageSkeleton";
import Select from "react-select";

export function CourseEdit() {
	const { objectId } = useParams();
	const editor = useRef(null);
	const redirector = useNavigate();
	const editorConfig = useMemo(() => getEditorConfig(), []);

	const [categories, setCategories] = useState<CategoryProps[]>([]);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [mainCourse, setMainCourse] = useState<CourseProps | null>(null);
	const [loading, setLoading] = useState(true);
	const { status } = useOutletContext<DashboardOutletContextProps>();

	// Fetch course
	const fetchCourse = useCallback(async () => {
		setLoading(true);
		try {
			const res = await API.get(`/course/${objectId}`);
			const course = res.data;

			setMainCourse(course);

			if (course?.image?.[0]) {
				setPreviewImage(
					`${import.meta.env.VITE_MEDIA_URL}/course/${course?.image?.[0]}`
				);
			}
		} catch (error) {
			getErrorResponse(error, true);
		} finally {
			setLoading(false);
		}
	}, [objectId]);

	const fetchCategories = useCallback(async () => {
		try {
			const res = await API.get("/category");
			setCategories(res?.data || []);
		} catch (error) {
			getErrorResponse(error, true);
		}
	}, []);

	useEffect(() => {
		fetchCourse();
		fetchCategories();
	}, [fetchCourse, fetchCategories]);

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			course_name: mainCourse?.course_name || "",
			course_short_name: mainCourse?.course_short_name || "",
			specialization: mainCourse?.specialization || "",
			stream: mainCourse?.stream || "",
			duration_value: (mainCourse?.duration as string)?.split(" ")?.[0] || "",
			duration_type: (mainCourse?.duration as string)?.split(" ")?.[1] || "",
			description: mainCourse?.description || "",
			certification_type: mainCourse?.certification_type || "",
			image: null as File | null,
			status: mainCourse?.status || "",
			best_for: mainCourse?.best_for || "",
		},
		validationSchema: CourseValidation,
		onSubmit: async (values) => {
			try {
				const fd = new FormData();
				fd.append("course_name", values.course_name);
				fd.append("course_short_name", values.course_short_name);
				fd.append("specialization", values.specialization);
				fd.append("stream", values.stream);
				fd.append("best_for", JSON.stringify(values.best_for));
				fd.append(
					"duration",
					`${values?.duration_value} ${values?.duration_type}`
				);
				fd.append("description", values.description);
				fd.append("certification_type", values.certification_type);
				fd.append("status", values.status);
				if (values.image) {
					fd.append("image", values.image);
				}

				const response = await API.patch(`/course/${objectId}`, fd);
				toast.success(response.data.message || "Course updated Successfully");
				redirector(`/dashboard/course`);
			} catch (error) {
				getErrorResponse(error);
			}
		},
	});

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] ?? null;
		formik.setFieldValue("image", file);
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => setPreviewImage(reader.result as string);
			reader.readAsDataURL(file);
		}
	};

	const specializationOptions = getCategoryAccodingToField(
		categories,
		"specialization"
	);
	const streamOptions = getCategoryAccodingToField(categories, "stream");
	const bestForOptions = getCategoryAccodingToField(categories, "Best For");
	const certificationOptions = getCategoryAccodingToField(
		categories,
		"Certification Type"
	);
	const bestForSelectOptions = bestForOptions.map((opt: any) => ({
		value: opt._id,
		label: opt.category_name || opt.name,
	}));

	if (loading) {
		return <EditSkeleton />;
	}

	return (
		<div>
			<Breadcrumbs
				title="Edit Course"
				breadcrumbs={[
					{ label: "Dashboard", path: "/dashboard" },
					{ label: "Courses", path: "/dashboard/course" },
					{
						label: mainCourse?.course_name || "",
						path: `/dashboard/course/${objectId}`,
					},
					{ label: "Edit" },
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
									<option value="hours">Hours</option>
									<option value="days">Days</option>
									<option value="weeks">Weeks</option>
									<option value="months">Months</option>
									<option value="years">Years</option>
								</select>
								{getFormikError(formik, "duration_type")}
							</div>
						</div>

						{/* Certification Type */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Certification Type
							</label>
							<select
								name="certification_type"
								value={formik.values.certification_type}
								onChange={formik.handleChange}
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							>
								<option value="">Select Certification</option>
								{certificationOptions.map((opt: any, idx: number) => (
									<option key={idx} value={opt._id}>
										{opt.category_name || opt.name}
									</option>
								))}
							</select>
							{getFormikError(formik, "certification_type")}
						</div>

						{/* Stream */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Stream
							</label>
							<select
								name="stream"
								value={formik.values.stream}
								onChange={formik.handleChange}
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							>
								<option value="">Select Stream</option>
								{streamOptions.map((opt: any, idx: number) => (
									<option key={idx} value={opt._id}>
										{opt.category_name || opt.name}
									</option>
								))}
							</select>
							{getFormikError(formik, "stream")}
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

					{/* Status */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							Status
						</label>
						<select
							name="status"
							value={formik.values.status}
							onChange={formik.handleChange}
							className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
						>
							<option value="">Select Status</option>
							{getStatusAccodingToField(status, "course").map(
								(opt: any, idx: number) => (
									<option key={idx} value={opt.parent_status}>
										{opt.parent_status}
									</option>
								)
							)}
						</select>
						{getFormikError(formik, "status")}
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
							{formik?.isSubmitting ? "Updating..." : "Update"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
