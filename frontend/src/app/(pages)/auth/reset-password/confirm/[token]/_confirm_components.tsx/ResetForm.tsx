"use client";

import Link from "next/link";
import React, { useState } from "react";
import { LuArrowLeft, LuLock, LuEye, LuEyeOff } from "react-icons/lu";
import { useFormik } from "formik";
import API from "@/contexts/API";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useRouter, useParams } from "next/navigation";
import { ResetPasswordValidation } from "@/contexts/ValidationSchema";
import Image from "next/image";

const ResetPasswordForm = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const router = useRouter();
	const { token } = useParams();

	const formik = useFormik({
		initialValues: {
			new_password: "",
			confirm_password: "",
			token: token || "",
		},
		enableReinitialize: true,
		validationSchema: ResetPasswordValidation,
		onSubmit: async (values) => {
			if (!token) {
				toast.error("Invalid or missing token.");
				return;
			}
			setIsSubmitting(true);
			try {
				const response = await API.post(`/profile/reset/`, values);
				toast.success(response.data.message || "Password reset successfully.");
				router.push("/auth/login");
			} catch (error) {
				const err = error as AxiosError<{ error: string }>;
				toast.error(err.response?.data?.error || "Something went wrong.");
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	return (
		<div className="flex h-screen w-full overflow-hidden">
			{/* Image side */}
			<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-700 to-purple-500 relative overflow-hidden">
				<div className="relative w-full h-full">
					<Image
						src="/img/section-images/campusaim-featured.png"
						alt="Forget password"
						fill
						className="object-cover"
						priority
					/>
				</div>
			</div>
			{/* Form side */}
			<div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-10">
				<div className="w-full max-w-md">
					<div className="flex justify-center items-center gap-2 mb-10">
						<div className="relative h-10 w-48">
							<Image
								src="/img/logo/campusaim-logo.png"
								alt="logo"
								fill
								className="object-contain"
							/>
						</div>
					</div>

					<div className="text-center mb-8">
						<h2 className="text-2xl font-semibold text-gray-800">
							Set a New Password
						</h2>
						<p className="text-sm text-gray-600 mt-1">
							Enter your new password below to reset your account.
						</p>
					</div>

					<form onSubmit={formik.handleSubmit} className="space-y-6">
						{/* Password Field */}
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Password
							</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
									<LuLock className="w-4 h-4" />
								</span>
								<input
									id="password"
									name="new_password"
									type={showPassword ? "text" : "password"}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.new_password}
									placeholder="Password"
									className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									{showPassword ? (
										<LuEyeOff className="w-4 h-4" />
									) : (
										<LuEye className="w-4 h-4" />
									)}
								</button>
							</div>
							{formik.touched.new_password && formik.errors.new_password && (
								<p className="text-xs text-red-500 mt-1">
									{formik.errors.new_password}
								</p>
							)}
						</div>

						{/* Confirm Password Field */}
						<div>
							<label
								htmlFor="confirm_password"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Confirm Password
							</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
									<LuLock className="w-4 h-4" />
								</span>
								<input
									id="confirm_password"
									name="confirm_password"
									type={showConfirmPassword ? "text" : "password"}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.confirm_password}
									placeholder="Confirm Password"
									className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									{showConfirmPassword ? (
										<LuEyeOff className="w-4 h-4" />
									) : (
										<LuEye className="w-4 h-4" />
									)}
								</button>
							</div>
							{formik.touched.confirm_password &&
								formik.errors.confirm_password && (
									<p className="text-xs text-red-500 mt-1">
										{formik.errors.confirm_password}
									</p>
								)}
						</div>

						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
						>
							{isSubmitting ? (
								<div className="flex items-center justify-center gap-2">
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									Resetting...
								</div>
							) : (
								"Reset Password"
							)}
						</button>

						<div className="text-center mt-4 flex justify-center items-center gap-1 text-sm font-medium">
							<LuArrowLeft className="text-purple-600" />
							<Link
								href="/auth/login"
								className="text-purple-600 hover:underline"
							>
								Back to Login
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ResetPasswordForm;
