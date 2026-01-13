import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { API } from "../../contexts/API";

export default function VerifyEmailConfirm() {
	const navigator = useNavigate();
	const { token } = useParams();
	const [loading, setLoading] = useState(true);
	const [verified, setVerified] = useState(false);
	const [error, setError] = useState("");
	const hasRun = useRef(false);

	useEffect(() => {
		if (hasRun.current) return;
		hasRun.current = true;

		const verifyEmail = async () => {
			if (!token) {
				setLoading(false);
				return;
			}

			try {
				const response = await API.get(`/profile/verify-email/${token}`);
				if (response.data?.message) {
					setVerified(true);
					Swal.fire({
						title: "Email Verified!",
						text: response.data.message,
						icon: "success",
						timer: 2000,
						showConfirmButton: false,
					}).then(() => navigator("/"));
				} else {
					throw new Error(response.data?.error || "Invalid token.");
				}
			} catch (error: any) {
				setError(error?.response?.data?.error || "Something went wrong.");
				Swal.fire({
					title: "Verification Failed!",
					text: error?.response?.data?.error || "Something went wrong.",
					icon: "error",
					confirmButtonText: "OK",
				}).then(() => {
					setTimeout(() => {
						navigator("/");
					}, 5000);
				});
			} finally {
				setLoading(false);
			}
		};

		verifyEmail();
	}, [token, navigator]);

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
