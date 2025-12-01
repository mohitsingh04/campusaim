import React, { useState, ReactNode } from "react";

interface TooltipProps {
	children: ReactNode;
	text: string;
	className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
	children,
	text,
	className = "",
}) => {
	const [show, setShow] = useState(false);

	return (
		<div
			className={`relative inline-block ${className}`}
			onMouseEnter={() => setShow(true)}
			onMouseLeave={() => setShow(false)}
			onFocus={() => setShow(true)}
			onBlur={() => setShow(false)}
			tabIndex={0}
			aria-label={text}
		>
			{children}
			{show && (
				<div
					className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 rounded bg-gray-800 text-white text-xs shadow-lg z-10 whitespace-nowrap"
					role="tooltip"
				>
					{text}
				</div>
			)}
		</div>
	);
};

export default Tooltip;
