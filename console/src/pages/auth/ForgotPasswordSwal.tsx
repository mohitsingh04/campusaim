import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { API } from "../../contexts/API";
import { getErrorResponse } from "../../contexts/Callbacks";
import { useTheme } from "../../hooks/useTheme";

export default function ForgotpasswordSwal() {
	const { email } = useParams();
	const [isRunning, setIsRunning] = useState(true);
	const [timer, setTimer] = useState(60);
	const { theme } = useTheme();

	useEffect(() => {
		if (!isRunning || timer <= 0) return setIsRunning(false);

		const interval = setInterval(() => {
			setTimer((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(interval);
	}, [isRunning, timer]);

	const handleResendMail = async () => {
		try {
			const response = await API.post(`/profile/forgot-password`, { email });
			Swal.fire({
				icon: "success",
				title: "Email Sent!",
				text:
					response.data?.message ||
					"A password reset link has been sent to your email.",
				timer: 3000,
				timerProgressBar: true,
				showConfirmButton: false,
			});

			setTimer(60);
			setIsRunning(true);
		} catch (error) {
			getErrorResponse(error);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
			<div className="flex flex-col items-center space-12 w-full max-w-4xl">
				{/* Logo */}
				<div className="mb-8 flex justify-center md:justify-start w-full md:w-1/3">
					{theme === "dark" ? (
						<img
							src="/img/logo/campusaim-logo.png"
							alt="Logo White"
							className="w-auto h-12"
						/>
					) : (
						<img
							src="/img/logo/campusaim-logo.png"
							alt="Logo Black"
							className="h-12 w-auto"
						/>
					)}{" "}
				</div>

				{/* Card */}
				<div className="w-full md:w-2/3">
					<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md p-8">
						<div className="text-center">
							<h4 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
								Forgot Password
							</h4>
							<p className="mb-6 text-gray-700 dark:text-gray-300">
								A password reset email has been sent to your registered email
								address. Follow the instructions in the email to reset your
								password. This link will expire in 24 hours.
							</p>

							{isRunning ? (
								<p className="text-gray-700 dark:text-gray-300 mb-4">
									You can request a new reset link in{" "}
									<span className="text-red-500">{timer} sec</span>.
								</p>
							) : (
								<p className="text-gray-700 dark:text-gray-300 mb-4">
									Didn’t receive the email?{" "}
									<span
										className="text-blue-500 cursor-pointer hover:underline"
										onClick={handleResendMail}
									>
										Click here to resend
									</span>
								</p>
							)}

							<Link
								className="text-blue-500 mt-2 inline-block hover:underline"
								to="/"
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
