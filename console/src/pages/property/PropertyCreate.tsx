import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import JoditEditor from "jodit-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useFormik } from "formik";
import { getEditorConfig } from "../../contexts/JoditEditorConfig";
import { API } from "../../contexts/API";
import {
	getCategoryAccodingToField,
	getErrorResponse,
	getFormikError,
} from "../../contexts/Callbacks";
import {
	CategoryProps,
	DashboardOutletContextProps,
	PropertyProps,
} from "../../types/types";
import toast from "react-hot-toast";
import { useNavigate, useOutletContext } from "react-router-dom";
import { PropertyValidation } from "../../contexts/ValidationsSchemas";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { phoneInputClass } from "../../common/ExtraData";

export function PropertyCreate() {
	const editor = useRef(null);
	const editorConfig = useMemo(() => getEditorConfig(), []);
	const redirector = useNavigate();
	const [categoryData, setCategoryData] = useState<CategoryProps[]>([]);
	const { authUser } = useOutletContext<DashboardOutletContextProps>();
	const [existingProperties, setExistingProperties] = useState<PropertyProps[]>(
		[]
	);

	const [selectedAcademicId, setSelectedAcademicId] = useState<string>("");

	const getAllProperties = useCallback(async () => {
		try {
			const [propertyRes, locationRes] = await Promise.allSettled([
				API.get("/property"),
				API.get("/locations"),
			]);

			if (propertyRes.status !== "fulfilled") {
				throw propertyRes.reason;
			}

			const properties = propertyRes.value.data;
			const locations =
				locationRes.status === "fulfilled" ? locationRes.value.data : [];

			const finalData = properties?.map((item: PropertyProps) => {
				const matchedLocation = locations.find(
					(loc: any) => Number(loc?.property_id) === Number(item?.uniqueId)
				);

				return {
					_id: item?._id,
					property_logo: item?.property_logo,
					property_name: item?.property_name,
					status: item?.status,
					city: matchedLocation?.property_city ?? "",
					state: matchedLocation?.property_state ?? "",
					country: matchedLocation?.property_country ?? "",
					property_email: item?.property_email,
				};
			});

			setExistingProperties(finalData);
		} catch (error) {
			getErrorResponse(error, true);
		}
	}, []);

	useEffect(() => {
		getAllProperties();
	}, [getAllProperties]);

	// fetch categories
	const getCategory = useCallback(async () => {
		try {
			const response = await API.get("/category");
			setCategoryData(response.data);
		} catch (error) {
			getErrorResponse(error, true);
		}
	}, []);

	useEffect(() => {
		getCategory();
	}, [getCategory]);

	const academicOptions: CategoryProps[] = useMemo(() => {
		const primary =
			getCategoryAccodingToField(categoryData, "academic type") || [];

		if (primary.length > 0) return primary;

		const keywordRegex =
			/academy|academic|coaching|college|online|school|university|institute|vocational/i;
		const fallback = (categoryData || []).filter(
			(c: any) =>
				(c.field && String(c.field).toLowerCase().includes("academic")) ||
				(c.category_name && keywordRegex.test(c.category_name))
		);

		return fallback.length > 0 ? fallback : categoryData || [];
	}, [categoryData]);

	const formik = useFormik({
		initialValues: {
			userId: authUser?._id || "",
			property_name: "",
			property_short_name: "",
			property_email: "",
			property_mobile_no: "",
			academic_type: "",
			academic_type_custom: "",
			property_type: "",
			property_description: "",
		},
		enableReinitialize: true,
		validationSchema: PropertyValidation,
		onSubmit: async (values) => {
			try {
				const payload = {
					...values,
					academic_type:
						values.academic_type_custom?.trim() !== ""
							? values.academic_type_custom.trim()
							: values.academic_type,
				};

				const response = await API.post("/property", payload);
				toast.success(response.data.message || "Property created successfully");
				redirector("/dashboard/property");
				window.location.reload();
			} catch (error) {
				getErrorResponse(error);
			}
		},
	});

	useEffect(() => {
		if (academicOptions && academicOptions.length > 0) {
			const first = academicOptions[0];
			if (!formik.values.academic_type && !formik.values.academic_type_custom) {
				setSelectedAcademicId(first._id ?? String(first.category_name));
				formik.setFieldValue("academic_type", first._id ?? first.category_name);
			}
		}
	}, [academicOptions]);

	const handleAcademicSelect = (cat: CategoryProps) => {
		const idOrName = cat._id ?? cat.category_name;
		setSelectedAcademicId(idOrName);
		formik.setFieldValue("academic_type", idOrName);
		formik.setFieldValue("academic_type_custom", "");
	};

	return (
		<div>
			<div className="mx-auto">
				<Breadcrumbs
					title="Create Property"
					breadcrumbs={[
						{ label: "Dashboard", path: "/dashboard" },
						{ label: "Property", path: "/dashboard/property" },
						{ label: "Create" },
					]}
				/>
				{/* Academic Category Selection */}
				{/* Compact 4-col cards — replace your cards wrapper with this */}
				<div className="bg-[var(--yp-primary)] rounded-xl shadow-sm p-4 mb-6">
					<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-3">
						Please select your academic type from below options
					</label>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
						{academicOptions && academicOptions.length > 0 ? (
							academicOptions.map((cat) => {
								const idOrName = cat._id ?? cat.category_name;
								return (
									<button
										key={idOrName}
										type="button"
										onClick={() => handleAcademicSelect(cat)}
										className={`text-left rounded-md border px-3 py-4 flex flex-col items-start gap-2 transition-shadow duration-150 focus:outline-none ${
											selectedAcademicId === idOrName
												? "border-blue-500 shadow-md ring-2 ring-blue-100"
												: "border-[var(--yp-border-primary)]"
										}`}
									>
										<div className="flex items-center gap-3 w-full">
											<div className="w-10 h-10 rounded-full flex items-center justify-center border">
												<span className="font-semibold text-sm">
													{String(cat.category_name || "")
														.split(" ")
														.map((s) => s[0])
														.slice(0, 2)
														.join("")}
												</span>
											</div>

											<div className="flex-1">
												<h4 className="text-sm font-semibold leading-tight">
													{cat.category_name}
												</h4>
												{cat.description && (
													<p
														className="text-xs text-[var(--yp-muted)] mt-1 line-clamp-2"
														dangerouslySetInnerHTML={{
															__html: cat.description,
														}}
													/>
												)}
											</div>
										</div>
									</button>
								);
							})
						) : (
							<div className="text-[var(--yp-muted)]">
								No academic types available
							</div>
						)}
					</div>
				</div>

				{/* Main form card */}
				<div className="bg-[var(--yp-primary)] rounded-xl shadow-sm">
					<form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
						{/* Header: show selected academic category name if available */}
						<div className="mb-2">
							<h2 className="text-lg font-semibold">
								{selectedAcademicId
									? academicOptions.find(
											(a) => (a._id ?? a.category_name) === selectedAcademicId
									  )?.category_name ?? "Add Property Details"
									: "Select Property Type to continue"}
							</h2>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Property Name */}
							<div className="relative">
								<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
									Property Name
								</label>
								<input
									type="text"
									name="property_name"
									value={formik.values.property_name}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									placeholder="Enter Property Name"
									className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
								/>

								{/* Suggestions dropdown */}
								{formik.values.property_name && (
									<div
										className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto 
          bg-[var(--yp-tertiary)] scrollbar-hide 
          rounded-lg shadow-lg"
									>
										{existingProperties
											.filter((prop) =>
												prop.property_name
													?.toLowerCase()
													.includes(formik.values.property_name.toLowerCase())
											)
											.map((prop) => {
												const logoUrl = prop.property_logo?.[0]
													? `${import.meta.env.VITE_MEDIA_URL}/${
															prop.property_logo[0]
													  }`
													: "/img/default-images/yp-property-logo.webp";

												return (
													<div
														key={prop._id}
														onClick={() =>
															formik.setFieldValue(
																"property_name",
																prop.property_name
															)
														}
														className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[var(--yp-secondary)] text-[var(--yp-text-primary)] border-b border-[var(--yp-border-primary)] last:border-0"
													>
														<img
															src={logoUrl}
															alt={prop.property_name}
															className="w-10 h-10 object-cover rounded-md border border-[var(--yp-border-primary)]"
														/>

														<div className="flex flex-col">
															<p className="font-medium">
																{prop.property_name}
															</p>

															{(prop.city || prop.state || prop.country) && (
																<p className="text-sm text-[var(--yp-muted)]">
																	{[prop.city, prop.state, prop.country]
																		.filter(Boolean)
																		.join(", ")}
																</p>
															)}

															{prop.property_email && (
																<p className="text-sm text-[var(--yp-muted)]">
																	{prop.property_email}
																</p>
															)}
														</div>
													</div>
												);
											})}

										{existingProperties.length === 0 && (
											<div className="px-3 py-2 text-[var(--yp-muted)]">
												No matches found
											</div>
										)}
									</div>
								)}

								{getFormikError(formik, "property_name")}
								{existingProperties.some(
									(p) => p.property_name === formik.values.property_name
								) && (
									<p className="text-[var(--yp-yellow-bg)] text-sm mt-1">
										⚠ This property name already exists, but you can still use
										it.
									</p>
								)}
							</div>

							{/* Property Short Name */}
							<div className="relative">
								<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
									Property Short Name
								</label>
								<input
									type="text"
									name="property_short_name"
									value={formik.values.property_short_name}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									placeholder="Enter Property Short Name"
									className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
								/>
								{getFormikError(formik, "property_short_name")}
							</div>

							{/* Email */}
							<div>
								<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
									Email
								</label>
								<input
									type="email"
									name="property_email"
									value={formik.values.property_email}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									placeholder="Enter Your Email"
									className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
								/>
								{getFormikError(formik, "property_email")}
							</div>

							{/* Phone */}
							<div>
								<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
									Contact Number
								</label>
								<PhoneInput
									country={"in"}
									value={formik.values.property_mobile_no}
									onChange={(phone) =>
										formik.setFieldValue("property_mobile_no", phone)
									}
									inputClass={phoneInputClass()?.input}
									buttonClass={phoneInputClass()?.button}
									inputProps={{
										name: "property_mobile_no",
										required: true,
										autoFocus: false,
									}}
								/>
								{getFormikError(formik, "property_mobile_no")}
							</div>

							{/* Academic Type select (kept for custom / alternate choice) */}
							{/* <div>
								<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
									Academic Type
								</label>

								<select
									name="academic_type"
									value={formik.values.academic_type}
									onChange={(e) => {
										formik.handleChange(e);
										if (e.target.value === "custom") {
											formik.setFieldValue("academic_type_custom", "");
											setSelectedAcademicId("");
										} else {
											setSelectedAcademicId(e.target.value);
										}
									}}
									onBlur={formik.handleBlur}
									className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
								>
									<option value="">Select Academic Type</option>
									{academicOptions?.map((cat) => (
										<option
											key={cat._id ?? cat.category_name}
											value={cat._id ?? cat.category_name}
										>
											{cat.category_name}
										</option>
									))}
								</select>
								{getFormikError(formik, "academic_type")}
							</div> */}

							{/* Property Type select */}
							<div>
								<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
									Property Type
								</label>
								<select
									name="property_type"
									value={formik.values.property_type}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
								>
									<option value="">Select Property Type</option>
									{getCategoryAccodingToField(
										categoryData,
										"property type"
									)?.map((cat, index) => (
										<option key={index} value={cat?._id}>
											{cat?.category_name}
										</option>
									))}
								</select>
								<p className="text-sm text-[var(--yp-muted)] mt-1">
									You can select property type from here as well.
								</p>
								{getFormikError(formik, "property_type")}
							</div>
						</div>

						{/* Description */}
						<div>
							<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
								Description
							</label>
							<JoditEditor
								ref={editor}
								value={formik.values.property_description}
								config={editorConfig}
								onBlur={(newContent) =>
									formik.setFieldValue("property_description", newContent)
								}
								onChange={(newContent) =>
									formik.setFieldValue("property_description", newContent)
								}
							/>
							{getFormikError(formik, "property_description")}
						</div>

						<div className="flex justify-start">
							<button
								type="submit"
								disabled={
									!(
										formik.values.academic_type ||
										formik.values.academic_type_custom?.trim() !== ""
									)
								}
								className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] disabled:opacity-50"
							>
								Create Property
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
