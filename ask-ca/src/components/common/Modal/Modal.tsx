import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

type ModalProps = {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
	title?: React.ReactNode;
};

export default function Modal({ open, onClose, children, title }: ModalProps) {
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const node = modalRef.current;
		if (!node) return;
		const focusable = node.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		) as NodeListOf<HTMLElement>;
		const first = focusable?.[0];
		const last = focusable?.[focusable.length - 1];

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Tab" && focusable.length > 0) {
				if (e.shiftKey) {
					if (document.activeElement === first) {
						e.preventDefault();
						last.focus();
					}
				} else {
					if (document.activeElement === last) {
						e.preventDefault();
						first.focus();
					}
				}
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		first?.focus();
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open]);

	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-200 animate-fade-in"
			aria-modal="true"
			role="dialog"
			tabIndex={-1}
		>
			<div
				ref={modalRef}
				className="relative w-full max-w-2xl mx-2 sm:mx-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-0 animate-modal-in flex flex-col"
				style={{ maxHeight: "90vh" }}
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-200 transition"
					aria-label="Close"
				>
					<X className="w-6 h-6" />
				</button>
				{title && (
					<div className="px-6 pt-6 pb-2">
						<h2 className="text-xl font-bold text-gray-900">{title}</h2>
						<div className="mt-2 border-b border-gray-100" />
					</div>
				)}
				<div
					className="overflow-y-auto px-6 pb-6"
					style={{ maxHeight: "65vh" }}
				>
					{children}
				</div>
			</div>
			<style jsx global>{`
				@keyframes fade-in {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
					}
				}
				.animate-fade-in {
					animation: fade-in 0.2s;
				}
				@keyframes modal-in {
					from {
						opacity: 0;
						transform: translateY(40px) scale(0.98);
					}
					to {
						opacity: 1;
						transform: none;
					}
				}
				.animate-modal-in {
					animation: modal-in 0.2s;
				}
			`}</style>
		</div>
	);
}
