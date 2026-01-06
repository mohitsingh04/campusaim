import { useState } from "react";
import { X } from "lucide-react";
import { API } from "../../../../contexts/API";
import Select from "react-select";
import { useFormik } from "formik";
import {
	getCategoryAccodingToField,
	getErrorResponse,
	getFormikError,
	getStatusAccodingToField,
} from "../../../../contexts/Callbacks";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import { PropertyCourseValidation } from "../../../../contexts/ValidationsSchemas";
import {
	CategoryProps,
	DashboardOutletContextProps,
	PropertyProps,
	ReqKoItem,
} from "../../../../types/types";
import { currencyOptions } from "../../../../common/ExtraData";

export default function EditCourseForm({
	categories,
	property,
	getPropertyCourse,
	setIsEditing,
	isEditing,
	getCourseById,
}: {
	requirements: ReqKoItem[];
	keyOutcomes: ReqKoItem[];
	categories: CategoryProps[];
	property: PropertyProps | null;
	getPropertyCourse: () => void;
	setIsEditing: any;
	isEditing: any;
	getCourseById: any;
}) {
	const [priceInput, setPriceInput] = useState("");
	const [priceCurrency, setPriceCurrency] = useState("INR");
	const { authUser, status } = useOutletContext<DashboardOutletContextProps>();
	const masterCourse = getCourseById(isEditing?.course_id);

	const formik = useFormik({
		initialValues: {
			course_id: isEditing?.course_id || "",
			course_name: isEditing?.course_name || masterCourse?.course_name || "",
			course_short_name:
				isEditing?.course_short_name || masterCourse?.course_short_name || "",
			specialization:
				isEditing?.specialization || masterCourse?.specialization || "",
			course_eligibility:
				isEditing?.course_eligibility || masterCourse?.course_eligibility || "",
			program_type: isEditing?.program_type || masterCourse?.program_type || "",
			course_format:
				isEditing?.course_format || masterCourse?.course_format || "",
			course_type: isEditing?.course_type_id || masterCourse?.course_type || "",
			duration_value:
				isEditing?.duration?.split(" ")?.[0] ||
				masterCourse?.duration?.split(" ")?.[0] ||
				"",
			duration_type:
				isEditing?.duration?.split(" ")?.[1] ||
				masterCourse?.duration?.split(" ")?.[1] ||
				"",
			cerification_info:
				isEditing?.cerification_info ??
				masterCourse?.cerification_info ??
				false,
			certification_type:
				isEditing?.certification_type || masterCourse?.certification_type || "",
			requirements:
				isEditing?.requirements ||
				masterCourse?.requirements ||
				([] as string[]),
			key_outcomes:
				isEditing?.key_outcomes ||
				masterCourse?.key_outcomes ||
				([] as string[]),
			best_for:
				isEditing?.best_for || masterCourse?.best_for || ([] as string[]),
			languages:
				isEditing?.languages || masterCourse?.languages || ([] as string[]),
			prices: Object.fromEntries(
				Object.entries(isEditing?.prices || {}).map(([key, val]) => [
					key,
					Number(val || 0),
				])
			),
			status: isEditing?.status || "",
		},
		enableReinitialize: true,
		validationSchema: PropertyCourseValidation,
		onSubmit: async (values) => {
			try {
				const payload = {
					...values,
					property_id: property?._id || "",
					userId: authUser?._id || "",
					final_requirement: values?.requirements,
					final_key_outcomes: values?.key_outcomes,
					duration: `${values?.duration_value} ${values?.duration_type}`,
					prices: Object.fromEntries(
						Object.entries(values.prices).map(([key, val]) => [
							key,
							Number(val || 0),
						])
					),
				};
				const response = await API.patch(
					`/property-course/${isEditing?._id}`,
					payload
				);
				toast.success(response.data.message || "Course Edited Successfully");
				getPropertyCourse();
				setIsEditing("");
			} catch (error) {
				getErrorResponse(error);
			}
		},
	});

	const handleAddPrice = () => {
		if (!priceInput) return;
		formik.setFieldValue("prices", {
			...formik.values.prices,
			[priceCurrency]: Number(priceInput),
		});
		setPriceInput("");
	};

	const courseTypeOptions = getCategoryAccodingToField(
		categories,
		"course type"
	);
	const specializationOptions = getCategoryAccodingToField(
		categories,
		"specialization"
	);
	const ProgramTypeOptions = getCategoryAccodingToField(
		categories,
		"Program Type"
	);
	const programTypeSelectOptions = ProgramTypeOptions.map((opt: any) => ({
		value: opt._id,
		label: opt.category_name || opt.name,
	}));
	const bestForOptions = getCategoryAccodingToField(categories, "Best For");
	const bestForSelectOptions = bestForOptions.map((opt: any) => ({
		value: opt._id,
		label: opt.category_name || opt.name,
	}));

	return (
		<div>
			<div>
				<form onSubmit={formik.handleSubmit} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Course Name */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Select Course
							</label>
							<input
								type="text"
								name="course_name"
								value={formik.values.course_name}
								disabled
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

						{/* Duration */}
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
							<select
								name="course_type"
								value={formik.values.course_type}
								onChange={formik.handleChange}
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							>
								<option value="">Select Course Type</option>
								{courseTypeOptions.map((opt: any, idx: number) => (
									<option key={idx} value={opt._id}>
										{opt.category_name || opt.name}
									</option>
								))}
							</select>
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
						<div className="col-span-2">
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

						{/* Course Eligibility */}
						<div className="col-span-2">
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

						{/* Price */}
						<div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="flex gap-2 items-center">
								<input
									type="number"
									value={priceInput}
									onChange={(e) => setPriceInput(e.target.value)}
									placeholder="Enter Price"
									className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
								/>
								<select
									value={priceCurrency}
									onChange={(e) => setPriceCurrency(e.target.value)}
									className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
								>
									<option value="">Select Currency</option>
									{currencyOptions.map((opt) => (
										<option key={opt} value={opt}>
											{opt}
										</option>
									))}
								</select>
								<button
									type="button"
									onClick={handleAddPrice}
									className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
								>
									Add
								</button>
							</div>
							<div className="col-span-1 md:col-span-3 flex flex-wrap gap-2 mt-2">
								{Object.entries(formik?.values?.prices).map(
									([currency, value]) =>
										value && (
											<span
												key={currency}
												className="flex items-center px-3 py-1 bg-[var(--yp-tertiary)] bg-opacity-30 text-[var(--yp-text-primary)] rounded-full text-sm"
											>
												{currency}: {value}
												<X
													className="ml-2 w-4 h-4 cursor-pointer"
													onClick={() =>
														formik.setFieldValue("prices", {
															...formik.values.prices,
															[currency]: "",
														})
													}
												/>
											</span>
										)
								)}
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
								<option value="">Select Certification</option>
								{getStatusAccodingToField(status, "Course").map(
									(opt: any, idx: number) => (
										<option key={idx} value={opt.parent_status}>
											{opt.parent_status}
										</option>
									)
								)}
							</select>
							{getFormikError(formik, "status")}
						</div>
					</div>

					{/* Update Button */}
					<div className="flex justify-start gap-2">
						<button
							type="submit"
							className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
						>
							Update Course
						</button>
						<button
							type="button"
							onClick={() => setIsEditing("")}
							className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
