"use client";

import Link from "next/link";
import { LuHeart } from "react-icons/lu";
import { LEGAL_LINKS } from "@/common/LegalLinks";

const FooterBottom = () => {
	return (
		<footer className="bg-(--primary-bg) border-t border-(--border) py-4">
			<div className="container mx-auto px-4">
				{/* Legal Links */}
				<div className="text-center text-sm mb-2">
					{LEGAL_LINKS.map((item, i) => (
						<span key={item.href}>
							<Link
								href={item.href}
								className="text-(--text-color-emphasis) hover:text-(--main) hover:underline transition"
							>
								{item.name}
							</Link>
							{i !== LEGAL_LINKS.length - 1 && (
								<span className="mx-2 text-(--text-color-emphasis)">|</span>
							)}
						</span>
					))}
				</div>

				{/* Copyright */}
				<p className="text-center text-sm text-(--text-color-emphasis)">
					© {new Date().getFullYear()}{" "}
					<Link href="/" className="font-medium text-(--main)">
						Campusaim
					</Link>
					, Inc. All Rights Reserved.
				</p>

				{/* Build with love */}
				<p className="flex items-center justify-center gap-1 text-sm text-(--text-color-emphasis) mt-1">
					Built with
					<LuHeart className="text-(--danger) fill-(--danger)" />
				</p>
			</div>
		</footer>
	);
};

export default FooterBottom;
