import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { API } from "../../contexts/API";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import { registerSchema } from "../../contexts/ValidationsSchemas";
import { getErrorResponse } from "../../contexts/Callbacks";

export function Register() {
	const redirector = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const formik = useFormik({
		initialValues: {
			username: "",
			name: "",
			email: "",
			mobile_no: "",
			password: "",
			confirm_password: "",
			terms: false,
			role: "Property Manager",
		},
		validationSchema: registerSchema,
		validate: (values) => {
			const errors: any = {};
			if (!values.terms) {
				errors.terms = "You must accept the Terms & Conditions";
			}
			return errors;
		},
		onSubmit: async (values, { setSubmitting }) => {
			try {
				const response = await API.post(`/profile/register`, values);
				toast.success(response.data.message);
				redirector(`/verify-email/${values.email}`);
			} catch (error) {
				getErrorResponse(error);
			} finally {
				setSubmitting(false);
			}
		},
	});

	return (
		<form onSubmit={formik.handleSubmit}>
			<div className="space-y-5">
				{/* Username */}
				<div>
					<input
						type="text"
						name="username"
						placeholder="Username"
						value={formik.values.username}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						className={`w-full px-4 py-3 border ${
							formik.touched.name && formik.errors.username
								? "border-red-500"
								: "border-gray-200"
						} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 text-sm`}
					/>
					{formik.touched.username && formik.errors.username && (
						<p className="text-xs text-red-500 mt-1">
							{formik.errors.username}
						</p>
					)}
				</div>
				{/* Name */}
				<div>
					<input
						type="text"
						name="name"
						placeholder="Full Name"
						value={formik.values.name}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						className={`w-full px-4 py-3 border ${
							formik.touched.name && formik.errors.name
								? "border-red-500"
								: "border-gray-200"
						} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 text-sm`}
					/>
					{formik.touched.name && formik.errors.name && (
						<p className="text-xs text-red-500 mt-1">{formik.errors.name}</p>
					)}
				</div>

				{/* Email */}
				<div>
					<input
						type="email"
						name="email"
						placeholder="Official Email"
						value={formik.values.email}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						className={`w-full px-4 py-3 border ${
							formik.touched.email && formik.errors.email
								? "border-red-500"
								: "border-gray-200"
						} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 text-sm`}
					/>
					{formik.touched.email && formik.errors.email && (
						<p className="text-xs text-red-500 mt-1">{formik.errors.email}</p>
					)}
				</div>

				{/* Mobile */}
				<div>
					<PhoneInput
						country={"in"}
						value={formik.values.mobile_no}
						onChange={(value) => formik.setFieldValue("mobile_no", value)}
						onBlur={formik.handleBlur}
						countryCodeEditable={false}
						enableSearch={true}
						inputClass={`!w-full !px-4 !py-3 !text-sm !rounded-lg !pl-12 !pt-6 !pb-6 ${
							formik.touched.mobile_no && formik.errors.mobile_no
								? "!border-red-500"
								: "!border-gray-200"
						} !focus:outline-none !focus:ring-2 !focus:ring-blue-500 !focus:border-transparent !text-gray-700 !placeholder-gray-400`}
						buttonClass="!bg-transparent !border-0 !pl-2"
					/>
					{formik.touched.mobile_no && formik.errors.mobile_no && (
						<p className="text-xs text-red-500 mt-1">
							{formik.errors.mobile_no}
						</p>
					)}
				</div>

				{/* Password */}
				<div className="relative">
					<input
						type={showPassword ? "text" : "password"}
						name="password"
						placeholder="Password"
						value={formik.values.password}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						className={`w-full px-4 py-3 border ${
							formik.touched.password && formik.errors.password
								? "border-red-500"
								: "border-gray-200"
						} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 pr-12 text-sm`}
						autoComplete="off"
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
					>
						{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
					</button>
					{formik.touched.password && formik.errors.password && (
						<p className="text-xs text-red-500 mt-1">
							{formik.errors.password}
						</p>
					)}
				</div>

				{/* Confirm Password */}
				<div className="relative">
					<input
						type={showConfirmPassword ? "text" : "password"}
						name="confirm_password"
						placeholder="Confirm Password"
						value={formik.values.confirm_password}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						className={`w-full px-4 py-3 border ${
							formik.touched.confirm_password && formik.errors.confirm_password
								? "border-red-500"
								: "border-gray-200"
						} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 pr-12 text-sm`}
					/>
					<button
						type="button"
						onClick={() => setShowConfirmPassword(!showConfirmPassword)}
						className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
					>
						{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
					</button>
					{formik.touched.confirm_password &&
						formik.errors.confirm_password && (
							<p className="text-xs text-red-500 mt-1">
								{formik.errors.confirm_password}
							</p>
						)}
				</div>

				<div className="flex items-center space-x-2">
					<input
						id="terms"
						type="checkbox"
						name="terms"
						checked={formik.values.terms}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
					/>
					<label
						htmlFor="terms"
						className="text-xs text-gray-600 leading-tight"
					>
						I agree to the{" "}
						<Link
							to="/terms"
							className="text-blue-500 hover:text-blue-600 underline"
						>
							Terms & Conditions
						</Link>
					</label>
				</div>

				{formik.touched.terms && formik.errors.terms && (
					<p className="text-xs text-red-500 mt-1">{formik.errors.terms}</p>
				)}

				{/* Submit */}
				<button
					type="submit"
					className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors shadow-lg text-sm"
					disabled={formik.isSubmitting}
				>
					{formik.isSubmitting ? "Registering..." : "Register"}
				</button>

				<p className="text-center text-xs text-gray-500">
					Already have an account?{" "}
					<Link
						to="/"
						className="text-blue-500 hover:text-blue-600 font-medium"
					>
						Sign In
					</Link>
				</p>
			</div>
		</form>
	);
}
