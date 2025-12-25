import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useMemo, useState } from "react";
import JoditEditor from "jodit-react";
import { API } from "../../../../contexts/API";
import Badge from "../../../../ui/badge/Badge";
import { PropertyProps } from "../../../../types/types";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import { currencyOptions } from "../../../../common/ExtraData";
import { getEditorConfig } from "../../../../contexts/JoditEditorConfig";

type CurrencyType = "INR" | "EUR" | "USD";

export default function AccomodationEdit({
	property,
	accomodation,
	getAccomdation,
	setIsEdit,
}: {
	property: PropertyProps | null;
	accomodation: any;
	getAccomdation: () => void;
	setIsEdit: any;
}) {
	const editorConfig = useMemo(() => getEditorConfig(), []);
	// Fallback description
	const [editorContent, setEditorContent] = useState(
		accomodation?.accomodation_description || ""
	);

	// Input for adding prices
	const [priceInput, setPriceInput] = useState<{
		value: number;
		type: CurrencyType;
	}>({ value: 0, type: "INR" });

	// Already saved prices with fallback
	const [accomodationPrice, setAccomodationPrice] = useState<
		Record<CurrencyType, number>
	>(accomodation?.accomodation_price || { INR: 0, EUR: 0, USD: 0 });

	const accomodationOptions = ["Co. Ed."];

	const formik = useFormik({
		initialValues: {
			property_id: property?._id || "",
			accomodation_name: accomodation?.accomodation_name || "Co. Ed.",
			accomodation_description: accomodation?.accomodation_description || "",
		},
		enableReinitialize: true,
		onSubmit: async (values, { setSubmitting }) => {
			setSubmitting(true);
			try {
				const payload = {
					...values,
					accomodation_description: editorContent || "",
					accomodation_price: accomodationPrice,
				};

				const response = await API.patch(
					`/accomodation/${accomodation?._id}`,
					payload
				);

				toast.success(
					response.data.message || "Accomodation Updated Successfully"
				);
				getAccomdation();
				setIsEdit("");
			} catch (error) {
				getErrorResponse(error);
			} finally {
				setSubmitting(false);
			}
		},
	});

	const addPrice = () => {
		const value = Number(priceInput.value) || 0;
		if (value <= 0) {
			toast.error("Price must be greater than 0");
			return;
		}
		setAccomodationPrice((prev) => ({
			...prev,
			[priceInput.type]: value,
		}));
		setPriceInput({ value: 0, type: "INR" });
	};

	return (
		<div className="space-y-6">
			<div>
				<form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
					{/* Accomodation Name */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							Accomodation Name
						</label>
						<select
							name="accomodation_name"
							value={formik.values.accomodation_name || ""}
							onChange={formik.handleChange}
							disabled
							className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
						>
							{accomodationOptions.map((name) => (
								<option key={name} value={name}>
									{name}
								</option>
							))}
						</select>
					</div>

					{/* Price Input + Select + Add Button */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							Add Price
						</label>
						<div className="flex gap-2 items-center">
							<input
								type="number"
								min={0}
								value={priceInput.value || 0}
								onChange={(e) =>
									setPriceInput({
										...priceInput,
										value: Number(e.target.value) || 0,
									})
								}
								placeholder="Enter price"
								className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
							/>
							<select
								value={priceInput.type}
								onChange={(e) =>
									setPriceInput({
										...priceInput,
										type: e.target.value as CurrencyType,
									})
								}
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
								onClick={addPrice}
								className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
							>
								Add
							</button>
						</div>

						{/* Show added prices */}
						<div className="mt-2 flex gap-4 flex-wrap">
							{Object.entries(accomodationPrice || {}).map(
								([currency, value]) =>
									value > 0 ? (
										<Badge
											label={`${currency}: ${value}`}
											color="green"
											key={currency}
										/>
									) : null
							)}
						</div>
					</div>

					{/* Description */}
					<div>
						<label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
							Description
						</label>
						<JoditEditor
							value={editorContent || ""}
							onChange={(newContent) => setEditorContent(newContent || "")}
							config={editorConfig}
						/>
					</div>

					{/* Submit */}
					<button
						type="submit"
						disabled={formik.isSubmitting}
						className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
					>
						{formik.isSubmitting ? "Updating..." : "Update"}
					</button>
					<button
						type="button"
						onClick={() => setIsEdit("")}
						className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)] ms-2"
					>
						Cancel
					</button>
				</form>
			</div>
		</div>
	);
}
