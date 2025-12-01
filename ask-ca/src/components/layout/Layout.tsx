"use client";

import { ReactNode, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";
import Footer from "@/components/footer/Footer";

export default function Layout({ children }: { children: ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="h-screen flex flex-col bg-gray-50">
			<Navbar setSidebarOpen={setSidebarOpen} />

			<div className="flex flex-1 pt-16">
				<Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

				<div className="flex-1 flex flex-col">
					<main className="flex-1 overflow-y-auto p-6">{children}</main>
					<Footer />
				</div>
			</div>
		</div>
	);
}
