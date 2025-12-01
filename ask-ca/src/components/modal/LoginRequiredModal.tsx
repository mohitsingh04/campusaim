"use client";

import Link from "next/link";
import { createPortal } from "react-dom";

type LoginRequiredModalProps = {
	onClose: () => void;
};

export default function LoginRequiredModal({
	onClose,
}: LoginRequiredModalProps) {
	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center"
			role="dialog"
			aria-modal="true"
			aria-labelledby="login-required-title"
			aria-describedby="login-required-desc"
		>
			<div
				className="absolute inset-0 bg-black/40 backdrop-blur-sm"
				onClick={onClose}
			/>

			<div className="relative bg-white/80 backdrop-blur-md rounded-xl shadow-2xl max-w-sm w-full p-8 transform transition-all animate-fadeInUp">
				<h2
					id="login-required-title"
					className="text-xl font-bold text-gray-900 mb-2"
				>
					🔒 Login Required
				</h2>
				<p id="login-required-desc" className="text-gray-600 text-sm mb-6">
					You need to be logged in to perform this action.
				</p>

				<div className="flex justify-center gap-3">
					<Link
						href="/auth/login"
						className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow hover:bg-blue-700 hover:scale-105 transition"
					>
						Login
					</Link>
					<button
						type="button"
						onClick={onClose}
						className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium shadow hover:bg-gray-200 hover:scale-105 transition"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
}
