"use client";
import Link from "next/link";
import React, { useState } from "react";
import { LuArrowLeft, LuMail } from "react-icons/lu";
import { useFormik } from "formik";
import API from "@/contexts/API";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { EmailValidation } from "@/contexts/ValidationSchema";
import Image from "next/image";

const ResetPassword = () => {
	const [isSending, setIsSending] = useState(false);
	const router = useRouter();

	const formik = useFormik({
		initialValues: { email: "" },
		validationSchema: EmailValidation,
		onSubmit: async (values) => {
			setIsSending(true);
			try {
				const response = await API.post("/profile/forgot-password", values);
				toast.success(response.data.message);
				router.push(`/auth/reset-password/send/${values.email}`);
			} catch (error) {
				const err = error as AxiosError<{ error: string }>;
				toast.error(err.response?.data?.error || "Something went wrong.");
			} finally {
				setIsSending(false);
			}
		},
	});

	return (
		<div className="flex h-screen w-full overflow-hidden">
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
							Reset Your Password
						</h2>
						<p className="text-sm text-gray-600 mt-1">
							Enter your email to receive a password reset link.
						</p>
					</div>

					<form onSubmit={formik.handleSubmit} className="space-y-6">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Email
							</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
									<LuMail className="w-4 h-4" />
								</span>
								<input
									id="email"
									name="email"
									type="email"
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.email}
									placeholder="Email"
									className={`w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300`}
								/>
							</div>
							{formik.touched.email && formik.errors.email && (
								<p className="text-xs text-red-500 mt-1">
									{formik.errors.email}
								</p>
							)}
						</div>

						<button
							type="submit"
							disabled={isSending}
							className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
						>
							{isSending ? (
								<div className="flex items-center justify-center gap-2">
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									Sending...
								</div>
							) : (
								"Send Reset Link"
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

export default ResetPassword;
