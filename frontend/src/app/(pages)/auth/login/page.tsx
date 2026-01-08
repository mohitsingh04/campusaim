"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { LuEye, LuEyeOff, LuMail, LuLock } from "react-icons/lu";
import API from "@/contexts/API";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { getToken } from "@/contexts/getAssets";
import { useRouter } from "next/navigation";
import { LoginValidation } from "@/contexts/ValidationSchema";
import Image from "next/image";
import GoogleLoginButton from "../_googleLogin/GoogleLoginButton";

const Login = () => {
	const [showPassword, setShowPassword] = useState(false);
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
			email: "",
			password: "",
		},
		validationSchema: LoginValidation,
		onSubmit: async (values) => {
			setIsLoading(true);
			try {
				const response = await API.post(`/profile/login`, values);
				toast.success(response.data.message);
				window.location.reload();
			} catch (error) {
				const err = error as AxiosError<{ error: string }>;
				toast.error(err.response?.data?.error || "Something went wrong.");
			} finally {
				setIsLoading(false);
			}
		},
	});

	return (
		<div className="min-h-screen flex">
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

			<div className="w-full lg:w-1/2 h-screen content-center overflow-y-auto px-6 py-10 bg-white">
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
									className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300"
								/>
							</div>
							{formik.touched.email && formik.errors.email && (
								<p className="text-xs text-red-500 mt-1">
									{formik.errors.email}
								</p>
							)}
						</div>

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
									name="password"
									type={showPassword ? "text" : "password"}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.password}
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
							{formik.touched.password && formik.errors.password && (
								<p className="text-xs text-red-500 mt-1">
									{formik.errors.password}
								</p>
							)}
						</div>

						<div className="flex justify-end">
							<Link
								href="/auth/reset-password"
								className="text-sm text-purple-600 hover:underline font-medium"
							>
								Forgot password?
							</Link>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full py-3 mt-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg font-medium shadow hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
						>
							{isLoading ? (
								<div className="flex justify-center items-center gap-2">
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									Logging in...
								</div>
							) : (
								"Login"
							)}
						</button>

						<p className="text-sm text-center text-gray-600 mt-4">
							Don&apos;t have an account?{" "}
							<Link
								href="/auth/register"
								className="text-purple-600 font-medium hover:underline"
							>
								Register
							</Link>
						</p>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Login;
