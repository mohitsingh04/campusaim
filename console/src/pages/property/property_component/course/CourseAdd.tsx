import { useState } from "react";
import { X } from "lucide-react";
import { API } from "../../../../contexts/API";
import Select from "react-select";
import { useFormik } from "formik";
import {
	getCategoryAccodingToField,
	getErrorResponse,
	getFormikError,
} from "../../../../contexts/Callbacks";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import { PropertyCourseValidation } from "../../../../contexts/ValidationsSchemas";
import {
	CategoryProps,
	CourseProps,
	DashboardOutletContextProps,
	PropertyProps,
} from "../../../../types/types";
import { currencyOptions } from "../../../../common/ExtraData";

export default function AddCourseForm({
	categories,
	allCourses,
	property,
	getPropertyCourse,
	setIsAdding,
}: {
	categories: CategoryProps[];
	allCourses: CourseProps[];
	property: PropertyProps | null;
	getPropertyCourse: () => void;
	setIsAdding: any;
}) {
	const [priceInput, setPriceInput] = useState("");
	const [priceCurrency, setPriceCurrency] = useState("INR");
	const { authUser } = useOutletContext<DashboardOutletContextProps>();

	const formik = useFormik({
		initialValues: {
			course_id: "",
			course_name: "",
			course_short_name: "",
			specialization: "",
			duration_value: "",
			duration_type: "",
			course_type: "",
			program_type: "",
			best_for: [] as string[],
			course_eligibility: "",
			price: Object.fromEntries(
				Object.entries({}).map(([key, val]) => [key, Number(val || 0)])
			),
		},
		validationSchema: PropertyCourseValidation,
		onSubmit: async (values) => {
			try {
				const payload = {
					...values,
					property_id: property?._id || "",
					userId: authUser?._id || "",
					duration: `${values?.duration_value} ${values?.duration_type}`,
					prices: Object.fromEntries(
						Object.entries(values.price).map(([key, val]) => [
							key,
							Number(val || 0),
						])
					),
				};
				const response = await API.post("/property-course", payload);
				toast.success(response.data.message || "Course created Successfully");
				getPropertyCourse();
				setIsAdding(false);
			} catch (error) {
				getErrorResponse(error);
			}
		},
	});

	const handleCourseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedId = e.target.value;
		formik.setFieldValue("course_id", selectedId);
		const selectedCourse = allCourses.find((c: any) => c._id === selectedId);
		if (selectedCourse) {
			formik.setValues({
				...formik.values,
				course_id: selectedCourse?._id || "",
				course_name: selectedCourse.course_name || "",
				course_short_name: selectedCourse.course_short_name || "",
				specialization: selectedCourse.specialization || "",
				duration_value: selectedCourse.duration?.split(" ")?.[0] || "",
				duration_type: selectedCourse.duration?.split(" ")?.[1] || "",
				course_type: selectedCourse.course_type || "",
				program_type: selectedCourse.program_type || "",
				course_eligibility: selectedCourse.course_eligibility || "",
				best_for: selectedCourse.best_for || [],
			});
		}
	};

	const handleAddPrice = () => {
		if (!priceInput) return;
		formik.setFieldValue("price", {
			...formik.values.price,
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
						{/* Course Select */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Select Course
							</label>
							<select
								name="course_name"
								value={formik.values.course_id}
								onChange={handleCourseSelect}
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							>
								<option value="">Select a course</option>
								{allCourses.map((course: any) => (
									<option key={course?._id} value={course?._id}>
										{course.course_name}
									</option>
								))}
							</select>
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
								{Object.entries(formik.values.price).map(
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
														formik.setFieldValue("price", {
															...formik.values.price,
															[currency]: "",
														})
													}
												/>
											</span>
										)
								)}
							</div>
						</div>
					</div>

					{/* Button */}
					<div className="flex justify-start gap-2">
						<button
							type="submit"
							className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
						>
							Create Course
						</button>
						<button
							type="button"
							onClick={() => setIsAdding(false)}
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
