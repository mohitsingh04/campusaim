import { useState, useRef, useMemo, useEffect, useCallback } from "react";
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
	ScholarshipProps,
	DashboardOutletContextProps,
} from "../../types/types";
import toast from "react-hot-toast";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { ScholarshipValidation } from "../../contexts/ValidationsSchemas";
import EditSkeleton from "../../ui/skeleton/EditPageSkeleton";
import ToggleButton from "../../ui/button/ToggleButton";
import Select from "react-select";
import { currencyOptions } from "../../common/ExtraData";
import { X } from "lucide-react";

export default function EditScholarship() {
	const { objectId } = useParams();
	const editor = useRef(null);
	const redirector = useNavigate();
	const editorConfig = useMemo(() => getEditorConfig(), []);
	const [priceInput, setPriceInput] = useState("");
	const [priceCurrency, setPriceCurrency] = useState("INR");
	const [incomeInput, setIncomeInput] = useState("");
	const [incomeCurrency, setIncomeCurrency] = useState("INR");

	const [categories, setCategories] = useState<CategoryProps[]>([]);
	const [mainScholarship, setMainScholarship] =
		useState<ScholarshipProps | null>(null);
	const [loading, setLoading] = useState(true);
	const { status } = useOutletContext<DashboardOutletContextProps>();

	// Fetch scholarship
	const fetchScholarship = useCallback(async () => {
		setLoading(true);
		try {
			const res = await API.get(`/scholarship/${objectId}`);
			const scholarship = res.data;

			setMainScholarship(scholarship);
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
		fetchScholarship();
		fetchCategories();
	}, [fetchScholarship, fetchCategories]);

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			scholarship_title: mainScholarship?.scholarship_title || "",
			scholarship_type: mainScholarship?.scholarship_type || "",

			scholarship_description:
				mainScholarship &&
				typeof mainScholarship.scholarship_description === "string"
					? mainScholarship.scholarship_description
					: "",

			age_min: mainScholarship?.age_criteria?.min || "",
			age_max: mainScholarship?.age_criteria?.max || "",

			qualification: mainScholarship?.qualification || "",

			min_marks: mainScholarship?.marks?.min || "",
			max_marks: mainScholarship?.marks?.max || "",

			location: mainScholarship?.location || [],
			card: mainScholarship?.card || [],
			gender: mainScholarship?.gender || [],
			cast: mainScholarship?.cast || [],
			religion: mainScholarship?.religion || [],
			entrance_exam: mainScholarship?.entrance_exam || [],

			sports_quotas: mainScholarship?.sports_quotas || false,

			scholarship_exam: mainScholarship?.scholarship_exam || "",
			scholarship_link: mainScholarship?.scholarship_link || "",
			army_quota: mainScholarship?.army_quota || false,

			annual_income: mainScholarship?.annual_income || {},

			scholarship_amount: mainScholarship?.scholarship_amount || {},

			start_date: mainScholarship?.start_date
				? new Date(mainScholarship.start_date).toISOString().split("T")[0]
				: "",
			end_date: mainScholarship?.end_date
				? new Date(mainScholarship.end_date).toISOString().split("T")[0]
				: "",

			status: mainScholarship?.status || "",
		},
		validationSchema: ScholarshipValidation,
		onSubmit: async (values) => {
			try {
				const payload = {
					scholarship_title: values.scholarship_title,
					scholarship_type: values.scholarship_type,
					scholarship_description: values.scholarship_description,
					qualification: values.qualification,

					age_criteria: {
						min: Number(values.age_min || 0),
						max: Number(values.age_max || 0),
					},

					marks: {
						min: Number(values.min_marks || 0),
						max: Number(values.max_marks || 0),
					},

					location: values.location,
					card: values.card,
					gender: values.gender,
					cast: values.cast,
					religion: values.religion,
					entrance_exam: values.entrance_exam,

					sports_quotas: values.sports_quotas,
					scholarship_exam: values.scholarship_exam,
					scholarship_link: values.scholarship_link,

					scholarship_amount: Object.fromEntries(
						Object.entries(values.scholarship_amount || {}).map(([k, v]) => [
							k,
							Number(v || 0),
						])
					),

					annual_income: Object.fromEntries(
						Object.entries(values.annual_income || {}).map(([k, v]) => [
							k,
							Number(v || 0),
						])
					),

					army_quota: values.army_quota,
					start_date: values.start_date,
					end_date: values.end_date,
					status: values.status,
				};
				console.log(payload);
				const response = await API.patch(`/scholarship/${objectId}`, payload);

				toast.success(
					response.data.message || "Scholarship updated Successfully"
				);
				redirector(`/dashboard/scholarship`);
			} catch (error) {
				getErrorResponse(error);
			}
		},
	});

	const removeCurrencyKey = (fieldName, currency) => {
		const obj = formik.values[fieldName] || {};
		const { [currency]: _removed, ...rest } = obj;
		formik.setFieldValue(fieldName, rest);
	};

	const handleAddScholarshipPrice = () => {
		if (!priceInput || !priceCurrency) return;
		formik.setFieldValue("scholarship_amount", {
			...formik.values.scholarship_amount,
			[priceCurrency]: Number(priceInput),
		});
		setPriceInput("");
		// optionally reset currency: setPriceCurrency("INR");
	};

	const handleAddAnnualIncome = () => {
		if (!incomeInput || !incomeCurrency) return;
		formik.setFieldValue("annual_income", {
			...formik.values.annual_income,
			[incomeCurrency]: Number(incomeInput),
		});
		setIncomeInput("");
		// optionally reset currency: setIncomeCurrency("INR");
	};

	const handleAddPrice = () => {
		if (!priceInput) return;
		formik.setFieldValue("scholarship_amount", {
			...formik.values.scholarship_amount,
			[priceCurrency]: Number(priceInput),
		});
		setPriceInput("");
	};

	const ScholarshipTypeOptions = getCategoryAccodingToField(
		categories,
		"scholarship type"
	);
	const ScholarshipTypeSelectOptions = ScholarshipTypeOptions.map(
		(opt: any) => ({
			value: opt._id,
			label: opt.category_name || opt.name,
		})
	);
	const CardOptions = getCategoryAccodingToField(categories, "Card");
	const CardSelectOptions = CardOptions.map((opt: any) => ({
		value: opt._id,
		label: opt.category_name || opt.name,
	}));
	const ScholarshipGenderOptions = getCategoryAccodingToField(
		categories,
		"Scholarship Gender"
	);
	const ScholarshipGenderSelectOptions = ScholarshipGenderOptions.map(
		(opt: any) => ({
			value: opt._id,
			label: opt.category_name || opt.name,
		})
	);
	const ScholarshipCastOptions = getCategoryAccodingToField(
		categories,
		"Scholarship Cast"
	);
	const ScholarshipCastSelectOptions = ScholarshipCastOptions.map(
		(opt: any) => ({
			value: opt._id,
			label: opt.category_name || opt.name,
		})
	);
	const ScholarshipReligionOptions = getCategoryAccodingToField(
		categories,
		"Scholarship Religion"
	);
	const ScholarshipReligionSelectOptions = ScholarshipReligionOptions.map(
		(opt: any) => ({
			value: opt._id,
			label: opt.category_name || opt.name,
		})
	);
	const ScholarshipEntranceExamOptions = getCategoryAccodingToField(
		categories,
		"Scholarship Entrance Exam Options"
	);
	const ScholarshipEntranceExamSelectOptions =
		ScholarshipEntranceExamOptions.map((opt: any) => ({
			value: opt._id,
			label: opt.category_name || opt.name,
		}));
	const ScholarshipLocationOptions = getCategoryAccodingToField(
		categories,
		"Scholarship Location Options"
	);
	const ScholarshipLocationSelectOptions = ScholarshipLocationOptions.map(
		(opt: any) => ({
			value: opt._id,
			label: opt.category_name || opt.name,
		})
	);

	if (loading) {
		return <EditSkeleton />;
	}

	return (
		<div>
			<Breadcrumbs
				title="Edit Scholarship"
				breadcrumbs={[
					{ label: "Dashboard", path: "/dashboard" },
					{ label: "Scholarships", path: "/dashboard/scholarship" },
					{
						label: mainScholarship?.scholarship_title || "",
						path: `/dashboard/scholarship/${objectId}`,
					},
					{ label: "Edit" },
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
							<Select
								name="scholarship_type"
								options={ScholarshipTypeSelectOptions}
								value={ScholarshipTypeSelectOptions.find(
									(opt) => opt.value === formik.values.scholarship_type
								)}
								onChange={(selected) =>
									formik.setFieldValue(
										"scholarship_type",
										selected ? selected.value : ""
									)
								}
								onBlur={() => formik.setFieldTouched("scholarship_type", true)}
								classNamePrefix="react-select"
							/>
							{getFormikError(formik, "scholarship_type")}
						</div>

						{/* Start Date */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Start Date
							</label>
							<input
								type="date"
								name="start_date"
								value={formik.values.start_date}
								onChange={formik.handleChange}
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							{getFormikError(formik, "start_date")}
						</div>

						{/* End Date */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								End Date
							</label>
							<input
								type="date"
								name="end_date"
								value={formik.values.end_date}
								onChange={formik.handleChange}
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							{getFormikError(formik, "end_date")}
						</div>

						{/* Age Criteria */}
						<div className="space-y-2">
							{/* Main Label */}
							<label className="block text-md font-medium text-[var(--yp-text-secondary)]">
								Age Criteria
							</label>

							{/* Grid for Inputs */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Minimum Age */}
								<div>
									<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
										Minimum Age
									</label>
									<input
										type="number"
										name="age_min"
										value={formik.values.age_min}
										onChange={formik.handleChange}
										placeholder="Enter Minimum Age"
										className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
									/>
									{getFormikError(formik, "age_min")}
								</div>

								{/* Maximum Age */}
								<div>
									<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
										Maximum Age
									</label>
									<input
										type="number"
										name="age_max"
										value={formik.values.age_max}
										onChange={formik.handleChange}
										placeholder="Enter Maximum Age"
										className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
									/>
									{getFormikError(formik, "age_max")}
								</div>
							</div>
						</div>

						{/* Marks */}
						<div className="space-y-2">
							{/* Main Label */}
							<label className="block text-md font-medium text-[var(--yp-text-secondary)]">
								Marks <span className="text-sm">(%)</span>
							</label>

							{/* Grid for Inputs */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Minimum Marks */}
								<div>
									<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
										Minimum Marks
									</label>
									<input
										type="number"
										name="min_marks"
										value={formik.values.min_marks}
										onChange={formik.handleChange}
										placeholder="Enter Minimum Marks"
										className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
									/>
									{getFormikError(formik, "min_marks")}
								</div>

								{/* Maximum Marks */}
								<div>
									<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
										Maximum Marks
									</label>
									<input
										type="number"
										name="max_marks"
										value={formik.values.max_marks}
										onChange={formik.handleChange}
										placeholder="Enter Maximum Marks"
										className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
									/>
									{getFormikError(formik, "max_marks")}
								</div>
							</div>
						</div>

						{/* Qualification */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Qualification
							</label>
							<input
								type="text"
								name="qualification"
								value={formik.values.qualification}
								onChange={formik.handleChange}
								placeholder="Enter Qualification"
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							{getFormikError(formik, "qualification")}
						</div>

						{/* Card */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Card
							</label>
							<Select
								isMulti
								name="card"
								options={CardSelectOptions}
								value={CardSelectOptions.filter((opt) =>
									formik.values.card.includes(opt.value)
								)}
								onChange={(selected) =>
									formik.setFieldValue(
										"card",
										selected ? selected.map((s) => s.value) : []
									)
								}
								classNamePrefix="react-select"
							/>
							{getFormikError(formik, "card")}
						</div>

						{/* Gender */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Gender
							</label>
							<Select
								isMulti
								name="gender"
								options={ScholarshipGenderSelectOptions}
								value={ScholarshipGenderSelectOptions.filter((opt) =>
									formik.values.gender.includes(opt.value)
								)}
								onChange={(selected) =>
									formik.setFieldValue(
										"gender",
										selected ? selected.map((s) => s.value) : []
									)
								}
								classNamePrefix="react-select"
							/>
						</div>

						{/* Cast */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Cast
							</label>
							<Select
								isMulti
								name="cast"
								options={ScholarshipCastSelectOptions}
								value={ScholarshipCastSelectOptions.filter((opt) =>
									formik.values.cast.includes(opt.value)
								)}
								onChange={(selected) =>
									formik.setFieldValue(
										"cast",
										selected ? selected.map((s) => s.value) : []
									)
								}
								classNamePrefix="react-select"
							/>
						</div>

						{/* Religion */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Religion
							</label>
							<Select
								isMulti
								name="religion"
								options={ScholarshipReligionSelectOptions}
								value={ScholarshipReligionSelectOptions.filter((opt) =>
									formik.values.religion.includes(opt.value)
								)}
								onChange={(selected) =>
									formik.setFieldValue(
										"religion",
										selected ? selected.map((s) => s.value) : []
									)
								}
								classNamePrefix="react-select"
							/>
						</div>

						{/* Entrance Exam */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Entrance Exam
							</label>
							<Select
								isMulti
								name="entrance_exam"
								options={ScholarshipEntranceExamSelectOptions}
								value={ScholarshipEntranceExamSelectOptions.filter((opt) =>
									formik.values.entrance_exam.includes(opt.value)
								)}
								onChange={(selected) =>
									formik.setFieldValue(
										"entrance_exam",
										selected ? selected.map((s) => s.value) : []
									)
								}
								classNamePrefix="react-select"
							/>
							{getFormikError(formik, "entrance_exam")}
						</div>

						{/* Scholarship Amount */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Scholarship Amount
							</label>

							<div className="flex gap-2 items-center">
								<input
									type="number"
									value={priceInput}
									onChange={(e) => setPriceInput(e.target.value)}
									placeholder="Enter Amount"
									className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
								/>

								<select
									value={priceCurrency}
									onChange={(e) => setPriceCurrency(e.target.value)}
									className="w-28 px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
								>
									<option value="">Currency</option>
									{currencyOptions.map((opt) => (
										<option key={opt} value={opt}>
											{opt}
										</option>
									))}
								</select>

								<button
									type="button"
									onClick={handleAddScholarshipPrice}
									className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
								>
									Add
								</button>
							</div>

							<div className="col-span-1 md:col-span-3 flex flex-wrap gap-2 mt-2">
								{Object.entries(formik?.values?.scholarship_amount || {}).map(
									([currency, value]) =>
										value !== undefined &&
										value !== null && (
											<span
												key={currency}
												className="flex items-center px-3 py-1 bg-[var(--yp-tertiary)] bg-opacity-30 text-[var(--yp-text-primary)] rounded-full text-sm"
											>
												{currency}: {value}
												<X
													className="ml-2 w-4 h-4 cursor-pointer"
													onClick={() =>
														removeCurrencyKey("scholarship_amount", currency)
													}
												/>
											</span>
										)
								)}
							</div>
						</div>

						{/* Annual Income */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Annual Income
							</label>

							<div className="flex gap-2 items-center">
								<input
									type="number"
									value={incomeInput}
									onChange={(e) => setIncomeInput(e.target.value)}
									placeholder="Enter Income"
									className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
								/>

								<select
									value={incomeCurrency}
									onChange={(e) => setIncomeCurrency(e.target.value)}
									className="w-28 px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
								>
									<option value="">Currency</option>
									{currencyOptions.map((opt) => (
										<option key={opt} value={opt}>
											{opt}
										</option>
									))}
								</select>

								<button
									type="button"
									onClick={handleAddAnnualIncome}
									className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
								>
									Add
								</button>
							</div>

							<div className="col-span-1 md:col-span-3 flex flex-wrap gap-2 mt-2">
								{Object.entries(formik?.values?.annual_income || {}).map(
									([currency, value]) =>
										value !== undefined &&
										value !== null && (
											<span
												key={currency}
												className="flex items-center px-3 py-1 bg-[var(--yp-tertiary)] bg-opacity-30 text-[var(--yp-text-primary)] rounded-full text-sm"
											>
												{currency}: {value}
												<X
													className="ml-2 w-4 h-4 cursor-pointer"
													onClick={() =>
														removeCurrencyKey("annual_income", currency)
													}
												/>
											</span>
										)
								)}
							</div>
						</div>

						{/* Location */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Location
							</label>
							<Select
								isMulti
								name="location"
								options={ScholarshipLocationSelectOptions}
								value={ScholarshipLocationSelectOptions.filter((opt) =>
									formik.values.location.includes(opt.value)
								)}
								onChange={(selected) =>
									formik.setFieldValue(
										"location",
										selected ? selected.map((s) => s.value) : []
									)
								}
								classNamePrefix="react-select"
							/>
						</div>

						{/* Scholarship Link */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Scholarship Link
							</label>
							<input
								type="url"
								name="scholarship_link"
								value={formik.values.scholarship_link}
								onChange={formik.handleChange}
								placeholder="Enter URL"
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							{getFormikError(formik, "scholarship_link")}
						</div>

						{/* Sports Quota */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Sports Quota
							</label>
							<ToggleButton
								enabled={formik.values.sports_quotas} // ✅ value from form
								onToggle={(val) => formik.setFieldValue("sports_quotas", val)} // ✅ update form
								label={formik.values.sports_quotas ? "Yes" : "No"}
							/>
						</div>

						{/* Army Quota */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Army Quota
							</label>
							<ToggleButton
								enabled={formik.values.army_quota} // ✅ value from form
								onToggle={(val) => formik.setFieldValue("army_quota", val)} // ✅ update form
								label={formik.values.army_quota ? "Yes" : "No"}
							/>
						</div>

						{/* Scholarship Exam */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Scholarship Exam
							</label>
							<ToggleButton
								enabled={formik.values.scholarship_exam} // ✅ value from form
								onToggle={(val) =>
									formik.setFieldValue("scholarship_exam", val)
								} // ✅ update form
								label={formik.values.scholarship_exam ? "Yes" : "No"}
							/>
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
							{getStatusAccodingToField(status, "scholarship").map(
								(opt: any, idx: number) => (
									<option key={idx} value={opt.parent_status}>
										{opt.parent_status}
									</option>
								)
							)}
						</select>
						{getFormikError(formik, "status")}
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
							{formik?.isSubmitting ? "Updating..." : "Update"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
