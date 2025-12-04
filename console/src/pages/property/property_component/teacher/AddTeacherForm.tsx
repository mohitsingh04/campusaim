import { ImageIcon } from "lucide-react";
import { useState } from "react";
import { useFormik } from "formik";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import {
	DashboardOutletContextProps,
	PropertyProps,
} from "../../../../types/types";
import { TeacherValidation } from "../../../../contexts/ValidationsSchemas";
import {
	getErrorResponse,
	getFormikError,
} from "../../../../contexts/Callbacks";

const inputClass =
	"w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]";

export function AddTeacherForm({
	onBack,
	property,
}: {
	onBack: () => void;
	property: PropertyProps | null;
}) {
	const [preview, setPreview] = useState<string | null>(null);
	const { authUser } = useOutletContext<DashboardOutletContextProps>();

	const formik = useFormik({
		initialValues: {
			teacher_name: "",
			expValue: "",
			expType: "",
			designation: "",
			department: "",
			profile: null as File | null,
		},
		validationSchema: TeacherValidation,
		onSubmit: async (values) => {
			// Combine experience value + type
			const experience = `${values.expValue} ${values.expType}`;

			// Create FormData
			const formData = new FormData();
			formData.append("userId", String(authUser?._id ?? ""));
			formData.append("teacher_name", values.teacher_name);
			formData.append("experience", experience);
			formData.append("designation", values.designation);
			formData.append("department", values.department);
			formData.append("property_id", String(property?._id ?? ""));

			if (values.profile) {
				formData.append("profile", values.profile); // file upload
			}

			try {
				const res = await API.post("/teacher", formData);
				toast.success(res.data.message);
				onBack();
				formik.resetForm();
			} catch (error) {
				getErrorResponse(error);
			}
		},
	});

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const url = URL.createObjectURL(file);
			setPreview(url);
			formik.setFieldValue("profile", file);
		}
	};

	return (
		<section className="p-4">
			<form
				onSubmit={formik.handleSubmit}
				className="grid grid-cols-1 sm:grid-cols-2 gap-6"
			>
				{/* Teacher Name */}
				<div>
					<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
						Name
					</label>
					<input
						type="text"
						name="teacher_name"
						placeholder="Enter teacher name"
						className={inputClass}
						value={formik.values.teacher_name}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
					/>
					{getFormikError(formik, "teacher_name")}
				</div>

				{/* Designation */}
				<div>
					<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
						Designation
					</label>
					<input
						type="text"
						name="designation"
						placeholder="Enter designation"
						className={inputClass}
						value={formik.values.designation}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
					/>
					{getFormikError(formik, "designation")}
				</div>

				{/* Experience Value */}
				<div>
					<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
						Experience
					</label>
					<input
						type="number"
						name="expValue"
						placeholder="Enter experience value"
						className={inputClass}
						value={formik.values.expValue}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
					/>
					{getFormikError(formik, "expValue")}
				</div>

				{/* Experience Type */}
				<div>
					<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
						Experience Type
					</label>
					<select
						name="expType"
						className={inputClass}
						value={formik.values.expType}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
					>
						<option value="">--select type--</option>
						<option value="years">Years</option>
						<option value="months">Months</option>
					</select>
					{getFormikError(formik, "expType")}
				</div>

				{/* Department */}
				<div>
					<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
						Department
					</label>
					<input
						type="text"
						name="department"
						placeholder="Enter Department"
						className={inputClass}
						value={formik.values.department}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
					/>
					{getFormikError(formik, "department")}
				</div>

				{/* Upload Profile */}
				<div className="col-span-1 sm:col-span-2">
					<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
						Profile Picture
					</label>
					<label className="flex flex-col items-center justify-center w-full h-40 border border-dashed border-[var(--yp-border-primary)] rounded-lg cursor-pointer bg-[var(--yp-input-primary)]">
						{preview ? (
							<img
								src={preview}
								alt="Preview"
								className="h-full object-contain rounded-lg"
							/>
						) : (
							<div className="flex flex-col items-center justify-center py-6">
								<ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--yp-text-secondary)]" />
								<p className="text-[var(--yp-muted)] mt-2 text-xs sm:text-sm">
									Click to upload profile picture
								</p>
							</div>
						)}
						<input
							type="file"
							accept="image/png, image/jpeg"
							className="hidden"
							onChange={handleFileChange}
						/>
					</label>
				</div>

				{/* Buttons */}
				<div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row justify-between gap-3 mt-6">
					<button
						type="button"
						onClick={onBack}
						className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
					>
						Save Teacher
					</button>
				</div>
			</form>
		</section>
	);
}
