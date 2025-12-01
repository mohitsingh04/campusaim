"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { API } from "@/services/api";
import Image from "next/image";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

interface User {
	email: string;
	verified: boolean;
}

export default function VerifyEmailSwal() {
	const { email } = useParams<{ email: string }>();
	const [isRunning, setIsRunning] = useState<boolean>(true);
	const [timer, setTimer] = useState<number>(60);
	const [user, setUser] = useState<User | null>(null);
	const router = useRouter();

	useEffect(() => {
		if (user?.verified) {
			router.push("/");
		}
	}, [user, router]);

	const getUser = useCallback(async () => {
		try {
			const response = await API.get("/users");
			const data: User[] = response.data;
			const filteredUser = data.find((u) => u.email === email);
			setUser(filteredUser || null);
		} catch (error) {
			console.log(error);
		}
	}, [email]);

	useEffect(() => {
		getUser();
	}, [getUser]);

	useEffect(() => {
		if (!isRunning || timer <= 0) return setIsRunning(false);

		const interval = setInterval(() => {
			setTimer((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(interval);
	}, [isRunning, timer]);

	// Resend verification email
	const handleResendMail = async () => {
		try {
			const response = await API.post(`/profile/verify-email/email/${email}`);

			Swal.fire({
				icon: "success",
				title: "Email Sent!",
				text: response.data?.message ?? "A verification email has been resent.",
				timer: 3000,
				timerProgressBar: true,
				showConfirmButton: false,
			});

			setTimer(60);
			setIsRunning(true);
		} catch (error) {
			const err = error as AxiosError<{ error: string }>;
			toast.error(err.response?.data?.error || "Something went wrong.");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
			<div className="flex flex-col items-center space-y-12 w-full max-w-4xl">
				{/* Logo */}
				<div className="mb-8 flex justify-center md:justify-start w-full md:w-1/3">
					<Image
						src="/logo-black-new.png"
						width={192}
						height={48}
						className="w-48"
						alt="Logo"
					/>
				</div>

				{/* Card */}
				<div className="w-full md:w-2/3">
					<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md p-8">
						<div className="text-center">
							<h4 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
								Verify Your Email
							</h4>
							<p className="mb-6 text-gray-700 dark:text-gray-300">
								A verification email has been sent to your registered email
								address. Please verify your account. This link will expire in 24
								hours.
							</p>

							{isRunning ? (
								<p className="text-gray-700 dark:text-gray-300 mb-4">
									You can resend verification email in{" "}
									<span className="text-red-500">{timer} sec</span>.
								</p>
							) : (
								<p className="text-gray-700 dark:text-gray-300 mb-4">
									Didn’t receive the email?{" "}
									<span
										onClick={handleResendMail}
										className="text-blue-500 cursor-pointer hover:underline"
									>
										Click here to resend
									</span>
								</p>
							)}

							<Link
								href="/"
								className="text-blue-500 mt-2 inline-block hover:underline"
							>
								Back to Login
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
