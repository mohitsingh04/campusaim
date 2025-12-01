"use client";

import { ReactNode, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import LeftSidebar from "@/components/sidebar/LeftSidebar";
import Link from "next/link";
import Image from "next/image";

export default function TopicLayout({ children }: { children: ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="min-h-screen bg-slate-50">
			<Navbar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />

			{/* Mobile Drawer */}
			<div
				className={`fixed inset-0 z-[999] lg:hidden transition-all duration-300 
				${sidebarOpen ? "visible opacity-100" : "invisible opacity-0"}`}
			>
				<div
					className="absolute inset-0 bg-black/40"
					onClick={() => setSidebarOpen(false)}
				/>

				<div
					className={`absolute top-0 left-0 h-full w-72 bg-white shadow-xl transition-transform duration-300
					${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
				>
					<div className="px-3 py-2 border-b border-gray-300 flex justify-between items-center">
						<Link href="/" className="flex items-center space-x-2">
							<Image
								src="/logo-black-new.png"
								alt="Logo"
								width={120}
								height={40}
							/>
						</Link>

						<button
							className="p-2 rounded-md bg-gray-100"
							onClick={() => setSidebarOpen(false)}
						>
							✕
						</button>
					</div>

					<div className="p-4 h-[calc(100vh-60px)] overflow-y-auto">
						<LeftSidebar />
					</div>
				</div>
			</div>

			{/* PAGE CONTENT — FULL WIDTH NOW */}
			<div className="w-full px-4 py-6">
				<div className="grid grid-cols-12 gap-6">
					<aside className="col-span-2 hidden lg:block">
						<LeftSidebar />
					</aside>

					{/* FULL WIDTH COLUMN */}
					<main className="col-span-12 lg:col-span-10">{children}</main>
				</div>
			</div>

			<Footer />
		</div>
	);
}
