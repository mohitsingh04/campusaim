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
	ExamProps,
	DashboardOutletContextProps,
} from "../../types/types";
import toast from "react-hot-toast";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { ExamValidation } from "../../contexts/ValidationsSchemas";
import EditSkeleton from "../../ui/skeleton/EditPageSkeleton";

export default function ExamsEdit() {
	const { objectId } = useParams();
	const editor = useRef(null);
	const redirector = useNavigate();
	const editorConfig = useMemo(() => getEditorConfig(), []);

	const [categories, setCategories] = useState<CategoryProps[]>([]);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [mainExam, setMainExam] = useState<ExamProps | null>(null);
	const [loading, setLoading] = useState(true);
	const { status } = useOutletContext<DashboardOutletContextProps>();

	// Fetch exam
	const fetchExam = useCallback(async () => {
		setLoading(true);
		try {
			const res = await API.get(`/exam/${objectId}`);
			const exam = res.data;

			setMainExam(exam);

			if (exam?.image?.[0]) {
				setPreviewImage(
					`${import.meta.env.VITE_MEDIA_URL}/exam/${exam?.image?.[0]}`
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
		fetchExam();
		fetchCategories();
	}, [fetchExam, fetchCategories]);

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			exam_name: mainExam?.exam_name || "",
			exam_short_name: mainExam?.exam_short_name || "",
			upcoming_exam_date: mainExam?.upcoming_exam_date || "",
			result_date: mainExam?.result_date || "",
			application_form_date: mainExam?.application_form_date || "",
			youtube_link: mainExam?.youtube_link || "",
			application_form_link: mainExam?.application_form_link || "",
			exam_form_link: mainExam?.exam_form_link || "",
			exam_mode: mainExam?.exam_mode || "",
			description: mainExam && typeof mainExam.description === "string" ? mainExam.description : "",
			image: null as File | null,
			status: mainExam?.status || "",
		},
		validationSchema: ExamValidation,
		onSubmit: async (values) => {
			try {
				const fd = new FormData();
				fd.append("exam_name", values.exam_name);
				fd.append("exam_short_name", values.exam_short_name);
				fd.append("upcoming_exam_date", values.upcoming_exam_date);
				fd.append("result_date", values.result_date);
				fd.append("application_form_date", values.application_form_date);
				fd.append("youtube_link", values.youtube_link);
				fd.append("application_form_link", values.application_form_link);
				fd.append("exam_form_link", values.exam_form_link);
				fd.append("exam_mode", values.exam_mode);
				fd.append("description", values.description);
				fd.append("status", values.status);
				if (values.image) {
					fd.append("image", values.image);
				}

				const response = await API.patch(`/exam/${objectId}`, fd);
				toast.success(response.data.message || "Exam updated Successfully");
				redirector(`/dashboard/exam`);
			} catch (error) {
				getErrorResponse(error);
			}
		},
	});

  console.log(typeof(mainExam?.description))

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] ?? null;
		formik.setFieldValue("image", file);
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => setPreviewImage(reader.result as string);
			reader.readAsDataURL(file);
		}
	};

	const examModeOptions = getCategoryAccodingToField(categories, "Exam Mode");

	if (loading) {
		return <EditSkeleton />;
	}

	return (
		<div>
			<Breadcrumbs
				title="Edit Exam"
				breadcrumbs={[
					{ label: "Dashboard", path: "/dashboard" },
					{ label: "Exams", path: "/dashboard/exam" },
					{
						label: mainExam?.exam_name || "",
						path: `/dashboard/exam/${objectId}`,
					},
					{ label: "Edit" },
				]}
			/>
			<div className="bg-[var(--yp-primary)] rounded-xl shadow-sm">
				<form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Exam Name */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Exam Name
							</label>
							<input
								type="text"
								name="exam_name"
								value={formik.values.exam_name}
								onChange={formik.handleChange}
								placeholder="Enter Exam Name"
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							{getFormikError(formik, "exam_name")}
						</div>

						{/* Exam Short Name */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Exam Short Name
							</label>
							<input
								type="text"
								name="exam_short_name"
								value={formik.values.exam_short_name}
								onChange={formik.handleChange}
								placeholder="Enter Exam Short Name"
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							{getFormikError(formik, "exam_short_name")}
						</div>

						{/* Upcoming Exam Date */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Upcoming Exam Date
							</label>
							<input
								type="date"
								name="upcoming_exam_date"
								value={formik.values.upcoming_exam_date}
								onChange={formik.handleChange}
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							{getFormikError(formik, "upcoming_exam_date")}
						</div>

						{/* Result Date */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Result Date
							</label>
							<input
								type="date"
								name="result_date"
								value={formik.values.result_date}
								onChange={formik.handleChange}
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							{getFormikError(formik, "result_date")}
						</div>

						{/* Application Form Date */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Application Form Date
							</label>
							<input
								type="date"
								name="application_form_date"
								value={formik.values.application_form_date}
								onChange={formik.handleChange}
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							{getFormikError(formik, "application_form_date")}
						</div>

						{/* Youtube Link */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Youtube Link
							</label>
							<input
								type="url"
								name="youtube_link"
								value={formik.values.youtube_link}
								onChange={formik.handleChange}
								placeholder="Enter Youtube Link"
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							{getFormikError(formik, "youtube_link")}
						</div>

						{/* Application Form Link */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Application Form Link
							</label>
							<input
								type="url"
								name="application_form_link"
								value={formik.values.application_form_link}
								onChange={formik.handleChange}
								placeholder="Enter Application Form Link"
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							{getFormikError(formik, "application_form_link")}
						</div>

						{/* Exam Form Link */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Exam Form Link
							</label>
							<input
								type="url"
								name="exam_form_link"
								value={formik.values.exam_form_link}
								onChange={formik.handleChange}
								placeholder="Enter Exam Form Link"
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							{getFormikError(formik, "exam_form_link")}
						</div>

						{/* Exam Mode */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Exam Mode
							</label>
							<select
								name="exam_mode"
								value={formik.values.exam_mode}
								onChange={formik.handleChange}
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							>
								<option value="">Select Mode</option>
								{examModeOptions.map((opt: any, idx: number) => (
									<option key={idx} value={opt._id}>
										{opt.category_name || opt.name}
									</option>
								))}
							</select>
							{getFormikError(formik, "exam_mode")}
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
							{getStatusAccodingToField(status, "exam").map(
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
								id="exam-image"
							/>
							<label htmlFor="exam-image" className="cursor-pointer block">
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
