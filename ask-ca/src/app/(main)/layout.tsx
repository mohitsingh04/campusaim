"use client";

import { ReactNode, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import LeftSidebar from "@/components/sidebar/LeftSidebar";
import RightSidebar from "@/components/sidebar/RightSidebar";
import Link from "next/link";
import Image from "next/image";
import AskQuestionButton from "@/components/common/Button/AskQuestionButton";

export default function MainLayout({ children }: { children: ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="min-h-screen bg-slate-50">
			<Navbar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />

			{/* --------------------------------------------- */}
			{/* 👇 MOBILE SIDEBAR (Drawer) */}
			{/* --------------------------------------------- */}
			<div
				className={`fixed inset-0 z-[999] lg:hidden transition-all duration-300 
                ${sidebarOpen ? "visible opacity-100" : "invisible opacity-0"}`}
			>
				{/* BACKDROP */}
				<div
					className="absolute inset-0 bg-black/40"
					onClick={() => setSidebarOpen(false)}
				/>

				{/* DRAWER */}
				<div
					className={`absolute top-0 left-0 h-full w-72 bg-white shadow-xl 
                    transform transition-transform duration-300 
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
				>
					<div className="px-3 py-2 border-b border-gray-300 flex justify-between items-center">
						{/* Logo */}
						<Link
							href="/"
							className="flex items-center space-x-2"
							prefetch={true}
						>
							<Image
								src="/images/logo/campusaim-logo.png"
								alt="AskHub Full Logo"
								width={120}
								height={40}
								className="rounded-lg"
							/>
						</Link>
						<button
							className="p-2 rounded-md bg-gray-100"
							onClick={() => setSidebarOpen(false)}
						>
							✕
						</button>
					</div>

					{/* REUSE LEFT SIDEBAR */}
					<div className="p-4 h-[calc(100vh-60px)] overflow-y-auto">
						<LeftSidebar />
					</div>
				</div>
			</div>
			{/* --------------------------------------------- */}

			<div className="pb-20 lg:pb-0">
				<div className="max-w-[1400px] mx-auto px-4 py-6">
					<div className="grid grid-cols-12 gap-6">
						<aside className="col-span-2 hidden lg:block">
							<LeftSidebar />
						</aside>
						<main className="col-span-12 lg:col-span-7">{children}</main>
						<AskQuestionButton />
						<aside className="col-span-12 lg:col-span-3">
							<RightSidebar />
						</aside>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
