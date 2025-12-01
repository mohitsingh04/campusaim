"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import { API } from "@/services/api";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

export default function VerifyEmailConfirm() {
	const router = useRouter();
	const { token } = useParams<{ token: string }>();
	const [loading, setLoading] = useState<boolean>(true);
	const [verified, setVerified] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const hasRun = useRef(false);

	useEffect(() => {
		if (hasRun.current) return;
		hasRun.current = true;

		const verifyEmail = async () => {
			if (!token) {
				setLoading(false);
				setError("Invalid token provided.");
				return;
			}

			try {
				const response = await API.get(`/profile/verify-email/${token}`);

				if (response.data?.message) {
					setVerified(true);

					await Swal.fire({
						title: "Email Verified!",
						text: response.data.message,
						icon: "success",
						timer: 2000,
						showConfirmButton: false,
					});

					router.push("/");
				} else {
					throw new Error(response.data?.error || "Invalid token.");
				}
			} catch (error) {
				const err = error as AxiosError<{ error: string }>;
				toast.error(err.response?.data?.error || "Something went wrong.");
				setTimeout(() => router.push("/"), 5000);
			} finally {
				setLoading(false);
			}
		};

		verifyEmail();
	}, [token, router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
			<div className="max-w-xl w-full text-center p-8">
				{loading ? (
					<h3 className="text-xl font-medium text-gray-700 dark:text-gray-200">
						Verifying...
					</h3>
				) : verified ? (
					<h1 className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
						Email Verified Successfully!
					</h1>
				) : (
					<div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-md">
						<h1 className="text-lg md:text-xl font-semibold">
							{error || "Invalid or Expired Token!"}
						</h1>
					</div>
				)}
			</div>
		</div>
	);
}
