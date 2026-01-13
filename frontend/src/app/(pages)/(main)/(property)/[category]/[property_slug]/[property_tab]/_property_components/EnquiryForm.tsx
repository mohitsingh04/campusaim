"use client";
import React from "react";
import { useFormik } from "formik";
import {
	FaUser,
	FaEnvelope,
	FaCity,
	FaCalendarAlt,
	FaPaperPlane,
} from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import { PropertyProps } from "@/types/types";
import toast from "react-hot-toast";
import API from "@/contexts/API";
import { AxiosError } from "axios";
import { EnquiryValidation } from "@/contexts/ValidationSchema";
import { LuCircleCheck } from "react-icons/lu";

const EnquiryForm = ({ property }: { property: PropertyProps }) => {
	const [submitted, setSubmitted] = React.useState(false);

	const formik = useFormik({
		initialValues: {
			property_id: property?.uniqueId || "",
			property_name: property?.property_name || "",
			name: "",
			email: "",
			contact: "",
			date: "",
			city: "",
			message: "",
		},
		validationSchema: EnquiryValidation,
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			try {
				const response = await API.post(`/add/enquiry`, values);
				toast.success(response.data.message);
				setSubmitted(true);
				resetForm();
			} catch (error) {
				const err = error as AxiosError<{ error: string }>;
				toast.error(err.response?.data?.error || "Something went wrong.");
			} finally {
				setSubmitting(false);
			}
		},
	});

	if (submitted) {
		return (
			<div className="bg-white shadow-sm rounded-2xl p-8 text-center">
				<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<LuCircleCheck className="w-8 h-8 text-green-600" />
				</div>
				<h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
				<p className="text-gray-600 mb-6 leading-relaxed">
					Your enquiry has been submitted successfully. We’ll get back to you
					shortly.
				</p>
				<button
					onClick={() => setSubmitted(false)}
					className="text-purple-600 font-medium hover:text-purple-700 bg-white px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
				>
					Send Another Enquiry
				</button>
			</div>
		);
	}

	return (
		<div
			className="my-4 bg-white sm:rounded-2xl shadow-sm mx-auto"
			id="enquiry"
		>
			<div className="border-b border-gray-300 text-xl font-semibold text-black mb-4 p-4">
				<h2>Enquiry</h2>
			</div>

			<form
				onSubmit={formik.handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4"
			>
				{/* Full Name */}
				<div className="relative">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Full Name
					</label>
					<div className="relative">
						<FaUser className="absolute left-3 top-4 text-gray-400" />
						<input
							type="text"
							name="name"
							placeholder="Enter your full name"
							className="w-full pl-10 pr-4 py-3 shadow-sm bg-gray-50/50 rounded-xl"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.name}
						/>
					</div>
					{formik.touched.name && formik.errors.name && (
						<div className="text-red-500 text-sm mt-1">
							{formik.errors.name}
						</div>
					)}
				</div>

				{/* Email */}
				<div className="relative">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Email Address
					</label>
					<div className="relative">
						<FaEnvelope className="absolute left-3 top-4 text-gray-400" />
						<input
							type="email"
							name="email"
							placeholder="you@example.com"
							className="w-full pl-10 pr-4 py-3 shadow-sm bg-gray-50/50 rounded-xl"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.email}
						/>
					</div>
					{formik.touched.email && formik.errors.email && (
						<div className="text-red-500 text-sm mt-1">
							{formik.errors.email}
						</div>
					)}
				</div>

				{/* Phone Input */}
				<div className="relative col-span-1">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Contact Number
					</label>
					<PhoneInput
						country={"in"}
						value={formik.values.contact}
						onChange={(phone) => formik.setFieldValue("contact", phone)}
						inputProps={{
							id: "contact",
							name: "contact",
							required: true,
							onBlur: formik.handleBlur,
							placeholder: "Enter your contact number",
							className:
								"w-full pl-10 pr-4 py-4 shadow-sm bg-gray-50/50 rounded-xl",
						}}
						buttonClass="!bg-gray-50/50 !border-0 !border-e-1 !border-gray-200"
						dropdownClass="!shadow-sm !rounded-md"
					/>
					{formik.touched.contact && formik.errors.contact && (
						<div className="text-red-500 text-sm mt-1">
							{formik.errors.contact}
						</div>
					)}
				</div>

				{/* Date */}
				<div className="relative">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Preferred Date
					</label>
					<div className="relative">
						<FaCalendarAlt className="absolute left-3 top-4 text-gray-400" />
						<input
							type="date"
							name="date"
							className="w-full pl-10 pr-4 py-3 shadow-sm bg-gray-50/50 rounded-xl"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.date}
						/>
					</div>
					{formik.touched.date && formik.errors.date && (
						<div className="text-red-500 text-sm mt-1">
							{formik.errors.date}
						</div>
					)}
				</div>

				{/* City */}
				<div className="relative">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Your City
					</label>
					<div className="relative">
						<FaCity className="absolute left-3 top-4 text-gray-400" />
						<input
							type="text"
							name="city"
							placeholder="e.g., Delhi"
							className="w-full pl-10 pr-4 py-3 shadow-sm bg-gray-50/50 rounded-xl"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.city}
						/>
					</div>
					{formik.touched.city && formik.errors.city && (
						<div className="text-red-500 text-sm mt-1">
							{formik.errors.city}
						</div>
					)}
				</div>

				{/* Submit Button */}
				<div className="md:col-span-2">
					<button
						type="submit"
						disabled={formik.isSubmitting}
						className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition ${
							formik.isSubmitting
								? "bg-purple-400 cursor-not-allowed"
								: "bg-purple-600 hover:bg-purple-700"
						}`}
					>
						{formik.isSubmitting ? (
							<>
								<span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
								Sending...
							</>
						) : (
							<>
								<FaPaperPlane /> Send Enquiry
							</>
						)}
					</button>
				</div>
			</form>
		</div>
	);
};

export default EnquiryForm;
