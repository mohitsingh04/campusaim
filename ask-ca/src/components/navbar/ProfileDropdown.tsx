"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import toast from "react-hot-toast";
import { API } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function ProfileDropdown() {
	const router = useRouter();
	const { authUser } = useAuth();
	const [loading, setLoading] = useState<boolean>(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const handleLogout = async () => {
		try {
			setLoading(true);
			await API.get("/profile/logout", { withCredentials: true });
			toast.success("Logged out");

			// Smooth delay before redirect
			setTimeout(() => {
				router.replace("/");
				window.location.reload();
			}, 500);
		} catch (error) {
			console.error(error);
			toast.error("Logout failed");
			setLoading(false);
		}
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="relative" ref={dropdownRef}>
			{/* Avatar Button */}
			<button
				onClick={() => setIsOpen((prev) => !prev)}
				className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 shadow-sm bg-white hover:bg-gray-100 hover:text-indigo-600 transition duration-200 cursor-pointer"
			>
				{authUser?.avatar?.[0] ? (
					<Image
						src={
							authUser?.avatar?.[0]
								? authUser.avatar[0].startsWith("http")
									? authUser.avatar[0]
									: `${process.env.NEXT_PUBLIC_MEDIA_URL}/${authUser?.avatar?.[0]}`
								: "/img/default-images/yp-user.webp"
						}
						alt={authUser?.name}
						className="h-full w-full object-cover rounded-full"
						width={80}
						height={80}
					/>
				) : (
					<User className="w-5 h-5" />
				)}
			</button>

			{/* Dropdown Menu */}
			{isOpen && (
				<div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl overflow-hidden z-50 border border-gray-100">
					<Link
						href={`/profile/${authUser?.username}`}
						className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition border-b border-gray-200"
						onClick={() => setIsOpen(false)}
					>
						My Profile
					</Link>
					<button
						className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-600 transition"
						onClick={handleLogout}
						disabled={loading}
					>
						{loading ? "Logging out..." : "Logout"}
					</button>
				</div>
			)}
		</div>
	);
}
