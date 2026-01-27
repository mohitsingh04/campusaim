import { useMemo } from "react";
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
	ReqKoItem,
} from "../../../../types/types";
import { currencyOptions } from "../../../../common/ExtraData";

export default function AddCourseForm({
	categories,
	allCourses,
	property,
	getPropertyCourse,
	setIsAdding,
	bestFor,
	courseEligibility,
}: {
	categories: CategoryProps[];
	allCourses: CourseProps[];
	property: PropertyProps | null;
	getPropertyCourse: () => void;
	setIsAdding: any;
	bestFor: ReqKoItem[];
	courseEligibility: ReqKoItem[];
}) {
	const { authUser } = useOutletContext<DashboardOutletContextProps>();

	/* -------------------------------------------------------------------------- */
	/*                               COURSE OPTIONS                               */
	/* -------------------------------------------------------------------------- */

	const masterCoursesMap = useMemo(() => {
		const map = new Map<string, CourseProps>();
		(allCourses || []).forEach((c) => map.set(String(c._id), c));
		return map;
	}, [allCourses]);

	const selectOptions = (allCourses || []).map((course) => ({
		value: course._id,
		label: course.course_name,
	}));

	/* -------------------------------------------------------------------------- */
	/*                                   FORMIK                                   */
	/* -------------------------------------------------------------------------- */

	const formik = useFormik({
		initialValues: {
			course_id: "",
			course_name: "",
			course_short_name: "",
			duration_value: "",
			duration_type: "",
			course_type: "",
			degree_type: "",
			program_type: "",
			best_for: [] as string[],
			course_eligibility: [] as string[],
			specialization_fees: [] as {
				specialization_id: string;
				tuition_fee: number | "";
				registration_fee: number | "";
				exam_fee: number | "";
				currency: string;
			}[],
		},

		validationSchema: PropertyCourseValidation,

		onSubmit: async (values) => {
			try {
				const payload = {
					course_id: values.course_id,
					course_name: values.course_name,
					course_short_name: values.course_short_name,
					course_type: values.course_type,
					degree_type: values.degree_type,
					program_type: values.program_type,
					best_for: values.best_for,
					course_eligibility: values.course_eligibility,
					property_id: property?._id,
					userId: authUser?._id,
					duration: `${values.duration_value} ${values.duration_type}`,
					specialization_fees: values.specialization_fees.map((s) => ({
						specialization_id: s.specialization_id,
						fees: {
							tuition_fee: Number(s.tuition_fee || 0),
							registration_fee: Number(s.registration_fee || 0),
							exam_fee: Number(s.exam_fee || 0),
							currency: s.currency,
						},
					})),
				};

				await API.post("/property-course", payload);
				toast.success("Course created successfully");
				getPropertyCourse();
				setIsAdding(false);
			} catch (error) {
				getErrorResponse(error);
			}
		},
	});

	/* -------------------------------------------------------------------------- */
	/*                            COURSE SELECT HANDLER                            */
	/* -------------------------------------------------------------------------- */

	const handleCourseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const course = masterCoursesMap.get(e.target.value);
		if (!course) return;

		formik.setValues({
			...formik.values,
			course_id: course._id || "",
			course_name: course.course_name || "",
			course_short_name: course.course_short_name || "",
			duration_value: course.duration?.split(" ")?.[0] || "",
			duration_type: course.duration?.split(" ")?.[1] || "",
			course_type: course.course_type || "",
			degree_type: course.degree_type || "",
			program_type: course.program_type || "",
			best_for: course.best_for || [],
			course_eligibility: course.course_eligibility || [],
			specialization_fees: [], // manual only
		});
	};

	/* -------------------------------------------------------------------------- */
	/*                         SPECIALIZATION HANDLERS                             */
	/* -------------------------------------------------------------------------- */

	const addSpecialization = () => {
		formik.setFieldValue("specialization_fees", [
			...formik.values.specialization_fees,
			{
				specialization_id: "",
				tuition_fee: "",
				registration_fee: "",
				exam_fee: "",
				currency: "INR",
			},
		]);
	};

	const removeSpecialization = (index: number) => {
		const updated = [...formik.values.specialization_fees];
		updated.splice(index, 1);
		formik.setFieldValue("specialization_fees", updated);
	};

	const selectedSpecializationIds = formik.values.specialization_fees.map(
		(s) => s.specialization_id,
	);

	/* -------------------------------------------------------------------------- */
	/*                                 OPTIONS                                    */
	/* -------------------------------------------------------------------------- */

	const specializationOptions = getCategoryAccodingToField(
		categories,
		"specialization",
	);

	const courseTypeSelectOptions = getCategoryAccodingToField(
		categories,
		"course type",
	).map((opt: any) => ({
		value: opt._id,
		label: opt.category_name || opt.name,
	}));

	const degreeTypeSelectOptions = getCategoryAccodingToField(
		categories,
		"Degree Type",
	).map((opt: any) => ({
		value: opt._id,
		label: opt.category_name || opt.name,
	}));

	const programTypeSelectOptions = getCategoryAccodingToField(
		categories,
		"Program Type",
	).map((opt: any) => ({
		value: opt._id,
		label: opt.category_name || opt.name,
	}));

	const bestForOptions = bestFor.map((b) => ({
		value: String(b._id),
		label: b.best_for ?? "",
	}));

	const bestForValue = bestForOptions.filter((opt) =>
		formik.values.best_for.includes(opt.value),
	);

	const courseEligibilityOptions = courseEligibility.map((c) => ({
		value: String(c._id),
		label: c.course_eligibility ?? "",
	}));

	const courseEligibilityValue = courseEligibilityOptions.filter((opt) =>
		formik.values.course_eligibility.includes(opt.value),
	);

	/* -------------------------------------------------------------------------- */
	/*                                   RENDER                                   */
	/* -------------------------------------------------------------------------- */

	return (
		<div>
			<div>
				<form onSubmit={formik.handleSubmit} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Select Course */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Select Course
							</label>
							<select
								name="course_select"
								value={
									selectOptions.find((opt: any) => {
										const raw = opt.raw;
										if (raw && raw.course_id)
											return (
												String(raw.course_id) ===
													String(formik.values.course_id) &&
												String(opt.value) === String(raw._id)
											);
										return (
											String(opt.value) === String(formik.values.course_id)
										);
									})?.value || ""
								}
								onChange={handleCourseSelect}
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							>
								<option value="">Select a course</option>
								{selectOptions.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
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

							<Select
								name="course_type"
								options={courseTypeSelectOptions}
								value={courseTypeSelectOptions.find(
									(opt) => opt.value === formik.values.course_type,
								)}
								onChange={(selected) =>
									formik.setFieldValue(
										"course_type",
										selected ? selected.value : "",
									)
								}
								onBlur={() => formik.setFieldTouched("course_type", true)}
								classNamePrefix="react-select"
							/>

							{getFormikError(formik, "course_type")}
						</div>

						{/* Degree Type */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Degree Type
							</label>

							<Select
								name="degree_type"
								options={degreeTypeSelectOptions}
								value={degreeTypeSelectOptions.find(
									(opt) => opt.value === formik.values.degree_type,
								)}
								onChange={(selected) =>
									formik.setFieldValue(
										"degree_type",
										selected ? selected.value : "",
									)
								}
								onBlur={() => formik.setFieldTouched("degree_type", true)}
								classNamePrefix="react-select"
							/>

							{getFormikError(formik, "degree_type")}
						</div>

						{/* Best For */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Best For
							</label>

							<Select
								isMulti
								name="best_for"
								options={bestForOptions}
								value={bestForValue}
								onChange={(selected: any) =>
									formik.setFieldValue(
										"best_for",
										(selected || []).map((s: any) => String(s.value)),
									)
								}
								onBlur={() => formik.setFieldTouched("best_for", true)}
								classNamePrefix="react-select"
							/>
							{getFormikError(formik, "best_for")}
						</div>

						{/* Course Eligibility */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Course Eligibility
							</label>
							<Select
								isMulti
								name="course_eligibility"
								options={courseEligibilityOptions}
								value={courseEligibilityValue}
								onChange={(selected: any) =>
									formik.setFieldValue(
										"course_eligibility",
										(selected || []).map((s: any) => String(s.value)),
									)
								}
								onBlur={() =>
									formik.setFieldTouched("course_eligibility", true)
								}
								classNamePrefix="react-select"
							/>
							{getFormikError(formik, "course_eligibility")}
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
									(opt) => opt.value === formik.values.program_type,
								)}
								onChange={(selected) =>
									formik.setFieldValue(
										"program_type",
										selected ? selected.value : "",
									)
								}
								onBlur={() => formik.setFieldTouched("program_type", true)}
								classNamePrefix="react-select"
							/>

							{getFormikError(formik, "program_type")}
						</div>
					</div>

					{/* Specializations & Fees */}
					<div className="space-y-4">
						{/* Header */}
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-semibold text-gray-800">
								Specializations & Fees
							</h3>

							<button
								type="button"
								onClick={addSpecialization}
								className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
							>
								+ Add Specialization
							</button>
						</div>

						{/* Column Labels (Desktop only) */}
						<div className="hidden md:grid grid-cols-12 gap-3 px-3 text-xs font-medium text-gray-500">
							<div className="col-span-4">Specialization</div>
							<div className="col-span-3">Tuition Fee</div>
							<div className="col-span-3">Reg. Fee</div>
							<div className="col-span-1">Currency</div>
							<div className="col-span-1 text-right">Action</div>
						</div>

						{/* Rows */}
						{formik.values.specialization_fees.map((item, idx) => (
							<div
								key={idx}
								className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-lg border bg-white shadow-sm"
							>
								{/* Specialization */}
								<div className="md:col-span-4">
									<select
										value={item.specialization_id}
										onChange={(e) =>
											formik.setFieldValue(
												`specialization_fees.${idx}.specialization_id`,
												e.target.value,
											)
										}
										className="w-full px-3 py-2 border rounded-md text-sm"
									>
										<option value="">Select specialization</option>
										{specializationOptions.map((opt: any) => (
											<option
												key={opt._id}
												value={opt._id}
												disabled={selectedSpecializationIds.includes(opt._id)}
											>
												{opt.category_name || opt.name}
											</option>
										))}
									</select>
								</div>

								{/* Tuition Fee */}
								<div className="md:col-span-3">
									<input
										type="number"
										placeholder="Tuition fee"
										value={item.tuition_fee}
										onChange={(e) =>
											formik.setFieldValue(
												`specialization_fees.${idx}.tuition_fee`,
												e.target.value,
											)
										}
										className="w-full px-3 py-2 border rounded-md text-sm"
									/>
								</div>

								{/* Registration Fee */}
								<div className="md:col-span-3">
									<input
										type="number"
										placeholder="Registration fee"
										value={item.registration_fee}
										onChange={(e) =>
											formik.setFieldValue(
												`specialization_fees.${idx}.registration_fee`,
												e.target.value,
											)
										}
										className="w-full px-3 py-2 border rounded-md text-sm"
									/>
								</div>

								{/* Currency */}
								<div className="md:col-span-1">
									<select
										value={item.currency}
										onChange={(e) =>
											formik.setFieldValue(
												`specialization_fees.${idx}.currency`,
												e.target.value,
											)
										}
										className="w-full px-2 py-2 border rounded-md text-sm"
									>
										{currencyOptions.map((c) => (
											<option key={c} value={c}>
												{c}
											</option>
										))}
									</select>
								</div>

								{/* Remove */}
								<div className="md:col-span-1 flex items-center justify-end">
									<button
										type="button"
										onClick={() => removeSpecialization(idx)}
										className="text-gray-400 hover:text-red-500 transition"
										title="Remove specialization"
									>
										<X size={18} />
									</button>
								</div>
							</div>
						))}
					</div>

					{/* Submit Button */}
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
