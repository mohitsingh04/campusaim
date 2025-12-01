"use client";

import { ReactNode } from "react";
import Navbar from "@/components/navbar/Navbar";

export default function ProfileLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen flex flex-col bg-white">
			<Navbar setSidebarOpen={() => {}} />
			<main className="flex-1 p-6">{children}</main>
		</div>
	);
}
