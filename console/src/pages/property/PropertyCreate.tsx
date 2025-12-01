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

	const getAllProperties = useCallback(async () => {
		try {
			// Run both requests, but don't break if one fails
			const [propertyRes, locationRes] = await Promise.allSettled([
				API.get("/property"),
				API.get("/locations"),
			]);

			// Properties must exist; if failed, throw
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

	const formik = useFormik({
		initialValues: {
			userId: authUser?._id || "",
			property_name: "",
			property_short_name: "",
			property_email: "",
			property_mobile_no: "",
			category: "",
			property_type: "",
			property_description: "",
		},
		enableReinitialize: true,
		validationSchema: PropertyValidation,
		onSubmit: async (values) => {
			try {
				const response = await API.post("/property", values);
				toast.success(response.data.message || "Property created successfully");
				redirector("/dashboard/property");
				window.location.reload();
			} catch (error) {
				getErrorResponse(error);
			}
		},
	});

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
				<div className="bg-[var(--yp-primary)] rounded-xl shadow-sm">
					<form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
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
														{/* Logo */}
														<img
															src={logoUrl}
															alt={prop.property_name}
															className="w-10 h-10 object-cover rounded-md border border-[var(--yp-border-primary)]"
														/>

														{/* Details */}
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
							{/* Property Email */}
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
							{/* Property Contact Number */}
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
							{/* Property Academic Type */}
							<div>
								<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
									Academic Type
								</label>
								<select
									name="category"
									value={formik.values.category}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
								>
									<option value="">Select Academic Type</option>
									{getCategoryAccodingToField(
										categoryData,
										"academic type"
									)?.map((cat, index) => (
										<option key={index} value={cat?.uniqueId}>
											{cat?.category_name}
										</option>
									))}
								</select>
								{getFormikError(formik, "category")}
							</div>
							{/* Property property Type */}
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
										<option key={index} value={cat?.uniqueId}>
											{cat?.category_name}
										</option>
									))}
								</select>
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
								className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
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
