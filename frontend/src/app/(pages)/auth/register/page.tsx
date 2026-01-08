"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { LuEye, LuEyeOff, LuLock, LuMail, LuUser } from "react-icons/lu";
import toast from "react-hot-toast";
import API from "@/contexts/API";
import PhoneInput from "react-phone-input-2";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { getToken } from "@/contexts/getAssets";
import { RegisterValidation } from "@/contexts/ValidationSchema";
import Image from "next/image";
import GoogleLoginButton from "../_googleLogin/GoogleLoginButton";

const Register = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [agreeToTerms, setAgreeToTerms] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const checkToken = async () => {
			const token = await getToken();
			if (token) {
				router.push("/");
			}
		};

		checkToken();
	}, [router]);

	const formik = useFormik({
		initialValues: {
			username: "",
			name: "",
			mobile_no: "",
			email: "",
			password: "",
			confirm_password: "",
		},
		validationSchema: RegisterValidation,
		onSubmit: async (values) => {
			if (!agreeToTerms) {
				toast.error("Please agree to the Terms and Conditions");
				return;
			}
			setIsLoading(true);
			try {
				const response = await API.post(`/profile/register`, values);
				toast.success(response.data.message);
				router.push(`/auth/verify-email/send/${values.email}`);
			} catch (error) {
				const err = error as AxiosError<{ error: string }>;
				toast.error(err.response?.data?.error || "Something went wrong.");
			} finally {
				setIsLoading(false);
			}
		},
	});

	return (
		<div className="flex h-screen w-full bg-purple-50 overflow-hidden">
			<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-700 to-purple-500 relative overflow-hidden">
				<div className="relative w-full h-full">
					<Image
						src="/img/section-images/yp-auth.webp"
						alt="Forget password"
						fill
						className="object-cover"
						priority
					/>
				</div>
			</div>
			<div className="w-full lg:w-1/2 h-screen overflow-y-auto px-6 py-10 bg-white">
				<div className="max-w-md mx-auto">
					<Link
						href="/"
						className="flex items-center justify-center gap-2 mb-8"
					>
						<div className="relative h-10 w-48">
							<Image
								src="/img/logo/campusaim-logo.png"
								alt="logo"
								fill
								className="object-contain"
							/>
						</div>
					</Link>

					<GoogleLoginButton />

					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-gray-300" />
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-2 bg-white text-gray-500">or</span>
						</div>
					</div>

					<form onSubmit={formik.handleSubmit} className="space-y-5 pb-10">
						{[
							{
								id: "username",
								label: "Username",
								icon: <LuUser />,
								type: "text",
							},
							{
								id: "name",
								label: "Full Name",
								icon: <LuUser />,
								type: "text",
							},
							{
								id: "email",
								label: "Email",
								icon: <LuMail />,
								type: "email",
							},
						].map(({ id, label, icon, type }) => (
							<div key={id}>
								<label
									htmlFor={id}
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									{label}
								</label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
										{icon}
									</span>
									<input
										id={id}
										name={id}
										type={type}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										value={formik.values[id as keyof typeof formik.values]}
										placeholder={label}
										className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
									/>
								</div>
								{formik.touched[id as keyof typeof formik.touched] &&
									formik.errors[id as keyof typeof formik.errors] && (
										<p className="text-xs text-red-500 mt-1">
											{formik.errors[id as keyof typeof formik.errors]}
										</p>
									)}
							</div>
						))}

						<div>
							<label
								htmlFor="mobile_no"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Mobile No.
							</label>
							<PhoneInput
								country={"in"}
								value={formik.values.mobile_no}
								onChange={(value) => formik.setFieldValue("mobile_no", value)}
								inputProps={{
									name: "mobile_no",
									required: true,
								}}
								inputClass={`!w-full py-6 !pl-14 !pr-4 !rounded-lg !text-base !border ${
									formik.touched.mobile_no && formik.errors.mobile_no
										? "!border-red-500"
										: "!border-gray-300"
								}`}
								buttonClass={`!border-r !border-gray-300 !bg-white !rounded-l-lg`}
								containerClass="w-full"
							/>
							{formik.touched.mobile_no && formik.errors.mobile_no && (
								<p className="text-xs text-red-500 mt-1">
									{formik.errors.mobile_no}
								</p>
							)}
						</div>

						{[
							{
								id: "password",
								label: "Password",
								show: showPassword,
								toggle: setShowPassword,
							},
							{
								id: "confirm_password",
								label: "Confirm Password",
								show: showConfirmPassword,
								toggle: setShowConfirmPassword,
							},
						].map(({ id, label, show, toggle }) => (
							<div key={id}>
								<label
									htmlFor={id}
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									{label}
								</label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
										<LuLock className="w-4 h-4" />
									</span>
									<input
										id={id}
										name={id}
										type={show ? "text" : "password"}
										placeholder={label}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										value={formik.values[id as keyof typeof formik.values]}
										className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
									/>
									<button
										type="button"
										onClick={() => toggle(!show)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
									>
										{show ? (
											<LuEyeOff className="w-4 h-4" />
										) : (
											<LuEye className="w-4 h-4" />
										)}
									</button>
								</div>
								{formik.touched[id as keyof typeof formik.touched] &&
									formik.errors[id as keyof typeof formik.errors] && (
										<p className="text-xs text-red-500 mt-1">
											{formik.errors[id as keyof typeof formik.errors]}
										</p>
									)}
							</div>
						))}

						<div className="flex items-start gap-3 mt-3">
							<input
								id="terms"
								type="checkbox"
								checked={agreeToTerms}
								onChange={(e) => setAgreeToTerms(e.target.checked)}
								className="w-4 h-4 border-gray-300 rounded"
							/>
							<label htmlFor="terms" className="text-sm text-gray-600">
								I agree to the
								<Link
									href="#"
									className="text-purple-600 font-medium hover:underline ms-1"
								>
									Terms & Conditions
								</Link>
							</label>
						</div>

						<button
							type="submit"
							disabled={isLoading || !agreeToTerms}
							className="w-full py-3 mt-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg font-medium shadow hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
						>
							{isLoading ? (
								<div className="flex justify-center items-center gap-2">
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									Registering...
								</div>
							) : (
								"Register"
							)}
						</button>

						<p className="text-sm text-center text-gray-600 mt-4">
							Already have an account?{" "}
							<Link
								href="/auth/login"
								className="text-purple-600 font-medium hover:underline"
							>
								Login here
							</Link>
						</p>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Register;
