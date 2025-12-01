"use client";

import React, { useState, type ReactNode } from "react";
import LoginRequiredModal from "@/components/modal/LoginRequiredModal";
import { useAuth } from "@/context/AuthContext";

type ProtectedButtonProps = React.ComponentPropsWithoutRef<"button"> & {
	children: ReactNode;
	onClick?: () => void;
};

const ProtectedButton = React.forwardRef<
	HTMLButtonElement,
	ProtectedButtonProps
>(({ children, onClick, className = "", ...rest }, ref) => {
	const { authUser } = useAuth();
	const [showModal, setShowModal] = useState(false);

	const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (!authUser) {
			e.preventDefault();
			setShowModal(true);
		} else if (onClick) {
			onClick();
		}
	};

	return (
		<>
			<button ref={ref} onClick={handleClick} className={className} {...rest}>
				{children}
			</button>
			{showModal && <LoginRequiredModal onClose={() => setShowModal(false)} />}
		</>
	);
});

ProtectedButton.displayName = "ProtectedButton";
export default ProtectedButton;
