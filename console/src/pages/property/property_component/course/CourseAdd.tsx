import { useState, useMemo } from "react";
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
	allPropertyCourse,
	getPropertyCourse,
	setIsAdding,
	getCategoryById,
}: {
	categories: CategoryProps[];
	allCourses: CourseProps[];
	allProperty: PropertyProps[];
	allPropertyCourse: any[];
	property: PropertyProps | null;
	getPropertyCourse: () => void;
	setIsAdding: any;
	getCategoryById: any;
}) {
	const [priceInput, setPriceInput] = useState("");
	const [priceCurrency, setPriceCurrency] = useState("INR");
	const { authUser } = useOutletContext<DashboardOutletContextProps>();

	const getAcademicTypeLabel = (
		prop?: PropertyProps | null,
		cats?: CategoryProps[],
	) => {
		const at = prop?.academic_type;
		if (!at || !Array.isArray(cats)) return "";
		const cat = cats.find((c) => String(c._id) === String(at));
		return String(cat?.category_name || cat?.name || "")
			.trim()
			.toLowerCase();
	};

	const academicLabel = getAcademicTypeLabel(property, categories);

	const affiliatedIds: string[] =
		Array.isArray(property?.affiliated_by) && property?.affiliated_by.length
			? (property.affiliated_by as any[]).map((id) => String(id))
			: [];

	const propertyCoursesAll = Array.isArray(allPropertyCourse)
		? allPropertyCourse
		: [];
	const affiliatedPropertyCourses = propertyCoursesAll.filter((pc: any) =>
		affiliatedIds.includes(String(pc.property_id)),
	);
	const thisPropertyCourses =
		property && property._id
			? propertyCoursesAll.filter(
					(pc: any) => String(pc.property_id) === String(property._id),
				)
			: [];

	const masterCoursesMap = useMemo(() => {
		const m = new Map<string, any>();
		(Array.isArray(allCourses) ? allCourses : []).forEach((mc: any) =>
			m.set(String(mc._id), mc),
		);
		return m;
	}, [allCourses]);

	const universityCourseOptions = useMemo(() => {
		const pc = thisPropertyCourses || [];
		const masterFallback = Array.from(masterCoursesMap.values()).filter(
			(mc: any) => !pc.some((p: any) => String(p.course_id) === String(mc._id)),
		);
		return [...pc, ...masterFallback];
	}, [thisPropertyCourses, masterCoursesMap]);

	const collegeCourseOptions = useMemo(() => {
		return affiliatedPropertyCourses;
	}, [affiliatedPropertyCourses]);

	const courseOptionsSource = useMemo(() => {
		if (academicLabel.includes("college")) return collegeCourseOptions;
		if (academicLabel.includes("university")) return universityCourseOptions;
		return Array.isArray(allCourses) ? allCourses : [];
	}, [
		academicLabel,
		collegeCourseOptions,
		universityCourseOptions,
		allCourses,
	]);

	const findMasterCourseById = (id?: string) =>
		Array.isArray(allCourses)
			? allCourses.find((c) => String(c._id) === String(id))
			: undefined;

	const buildLabel = (item: any) => {
		// 1️⃣ Resolve master course if this is a property-course
		const master = item.course_id
			? masterCoursesMap.get(String(item.course_id))
			: null;

		// 2️⃣ Resolve course name safely
		const courseName =
			item.course_name || master?.course_name || "Unknown Course";

		// 3️⃣ Resolve specialization safely
		const specializationId = item.specialization || master?.specialization;

		const specializationName = specializationId
			? getCategoryById(specializationId)
			: null;

		return specializationName
			? `${courseName} — ${specializationName}`
			: courseName;
	};

	const selectOptions = courseOptionsSource.map((item: any) => ({
		value: item._id,
		label: buildLabel(item),
		raw: item,
	}));

	const formik = useFormik({
		initialValues: {
			course_id: "",
			course_name: "",
			course_short_name: "",
			specialization: [] as string[],
			duration_value: "",
			duration_type: "",
			course_type: "",
			degree_type: "",
			program_type: "",
			best_for: [] as string[],
			course_eligibility: [] as string[],
			price: Object.fromEntries(
				Object.entries({}).map(([key, val]) => [key, Number(val || 0)]),
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
						]),
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
		enableReinitialize: false,
	});

	const handleCourseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedId = e.target.value;
		const selectedOption = selectOptions.find(
			(opt) => String(opt.value) === String(selectedId),
		);
		if (!selectedOption) return;
		const raw = selectedOption.raw;
		if (raw && raw.course_id) {
			const master =
				masterCoursesMap.get(String(raw.course_id)) ||
				findMasterCourseById(raw.course_id) ||
				null;
			formik.setValues({
				...formik.values,
				course_id: raw.course_id || "",
				course_name: raw.course_name || master?.course_name || "",
				course_short_name:
					raw.course_short_name || master?.course_short_name || "",
				specialization: raw.specialization || master?.specialization || "",
				duration_value:
					(raw.duration || master?.duration || "").split(" ")?.[0] || "",
				duration_type:
					(raw.duration || master?.duration || "").split(" ")?.[1] || "",
				course_type: raw.course_type || master?.course_type || "",
				program_type: raw.program_type || master?.program_type || "",
				course_eligibility:
					raw.course_eligibility || master?.course_eligibility || "",
				best_for: raw.best_for || master?.best_for || [],
			});
			return;
		}
		const master = raw || findMasterCourseById(selectedId);
		if (master) {
			formik.setValues({
				...formik.values,
				course_id: master._id || "",
				course_name: master.course_name || "",
				course_short_name: master.course_short_name || "",
				specialization: master.specialization || "",
				duration_value: master.duration?.split(" ")?.[0] || "",
				duration_type: master.duration?.split(" ")?.[1] || "",
				course_type: master.course_type || "",
				program_type: master.program_type || "",
				course_eligibility: master.course_eligibility || "",
				best_for: master.best_for || [],
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
		"course type",
	);
	const specializationOptions = getCategoryAccodingToField(
		categories,
		"specialization",
	);
	const ProgramTypeOptions = getCategoryAccodingToField(
		categories,
		"Program Type",
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
						{/* Select Course */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Select Course
							</label>
							<select
								name="course_select"
								value={
									selectOptions.find((opt) => {
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
									formik.values.best_for?.includes(opt.value),
								)}
								onChange={(selected) =>
									formik.setFieldValue(
										"best_for",
										Array.isArray(selected) ? selected.map((s) => s.value) : [],
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
										),
								)}
							</div>
						</div>
					</div>

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
