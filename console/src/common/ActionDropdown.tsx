import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

export default function ActionDropdown({ children }: any) {
	const [open, setOpen] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		const handleClickOutside = (e: any) => {
			if (ref.current && !ref.current.contains(e.target)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div ref={ref} className="relative">
			<button
				onClick={() => setOpen((v) => !v)}
				className="p-2 rounded-lg hover:bg-[var(--yp-tertiary)]"
			>
				<MoreVertical className="w-5 h-5 text-[var(--yp-muted)]" />
			</button>

			{open && (
				<div className="absolute right-0 mt-2 w-48 bg-[var(--yp-tertiary)] shadow-lg rounded-lg z-20">
					{children}
				</div>
			)}
		</div>
	);
}
