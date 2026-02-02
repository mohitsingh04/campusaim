// import HeadingLine from "@/ui/headings/HeadingLine";
// import Link from "next/link";

// export default function PropertyMegaMenu({
// 	dropdownContent,
// 	activeDesktopSubMenu,
// 	setActiveDesktopSubMenu,
// 	onClose,
// }: {
// 	dropdownContent: any;
// 	activeDesktopSubMenu: any;
// 	setActiveDesktopSubMenu: any;
// 	onClose: any;
// }) {
// 	return (
// 		<div className="flex">
// 			{/* Left */}
// 			<div className="w-1/4 bg-(--main-emphasis)">
// 				<ul className="py-4">
// 					{Object.keys(dropdownContent).map((key) => (
// 						<li
// 							key={key}
// 							onMouseEnter={() => setActiveDesktopSubMenu(key)}
// 							className={`px-5 py-3 cursor-pointer ${
// 								activeDesktopSubMenu === key ? "font-semibold" : ""
// 							}`}
// 						>
// 							{key}
// 						</li>
// 					))}
// 				</ul>
// 			</div>

// 			{/* Right */}
// 			<div className="w-3/4 p-8 overflow-y-auto">
// 				{activeDesktopSubMenu &&
// 					Object.values(dropdownContent[activeDesktopSubMenu]).map(
// 						(section: any) => (
// 							<div key={section.title}>
// 								<HeadingLine title={section.title} />
// 								<ul>
// 									{section.links.map((l: any) => (
// 										<li key={l.name}>
// 											<Link href={l.href} onClick={onClose}>
// 												{l.name}
// 											</Link>
// 										</li>
// 									))}
// 								</ul>
// 							</div>
// 						),
// 					)}
// 			</div>
// 		</div>
// 	);
// }
"use client";

import HeadingLine from "@/ui/headings/HeadingLine";
import Link from "next/link";
import { MegaMenuGroup } from "./Navbar";

interface Props {
	dropdownContent: Record<string, MegaMenuGroup>;
	activeDesktopSubMenu: string | null;
	setActiveDesktopSubMenu: (key: string) => void;
	onClose: () => void;
}

export default function PropertyMegaMenu({
	dropdownContent,
	activeDesktopSubMenu,
	setActiveDesktopSubMenu,
	onClose,
}: Props) {
	return (
		<div className="flex">
			{/* LEFT SIDE – CATEGORY LIST */}
			<div className="w-1/4 bg-(--main-emphasis) text-(--white)">
				<ul className="py-4">
					{Object.keys(dropdownContent).map((key) => {
						const isActive = activeDesktopSubMenu === key;

						return (
							<li
								key={key}
								onMouseEnter={() => setActiveDesktopSubMenu(key)}
								className={`px-5 py-3 cursor-pointer text-sm relative transition ${
									isActive ? "font-semibold" : "font-medium"
								}`}
							>
								{key}

								{/* Arrow Indicator */}
								{isActive && (
									<span className="absolute top-1/2 -translate-y-1/2 left-full border-y-8 border-l-8 border-y-transparent border-l-(--main-emphasis)" />
								)}
							</li>
						);
					})}
				</ul>
			</div>

			{/* RIGHT SIDE – CONTENT */}
			<div className="w-3/4 p-8 max-h-[500px] overflow-y-auto">
				{activeDesktopSubMenu &&
				dropdownContent[activeDesktopSubMenu] ? (
					<div className="grid grid-cols-4 gap-x-8">
						{Object.values(
							dropdownContent[activeDesktopSubMenu],
						).map((section) => (
							<div key={section.title}>
								<HeadingLine
									title={section.title}
									className="font-semibold text-(--text-color-emphasis)!"
								/>

								<ul className="space-y-1">
									{section.links.slice(0, 16).map((link) => (
										<li key={link.name} className="py-1">
											<Link
												href={link.href || ""}
												onClick={onClose}
												className="text-sm text-(--text-color) hover:text-(--main)"
											>
												{link.name}
											</Link>
										</li>
									))}
								</ul>

								{/* VIEW ALL */}
								{section.viewAll && (
									<Link
										href={section.viewAll}
										onClick={onClose}
										className="text-sm text-(--main) hover:underline mt-4 inline-block"
									>
										VIEW ALL
									</Link>
								)}
							</div>
						))}
					</div>
				) : (
					<div className="text-center text-(--text-color-emphasis)">
						No details available.
					</div>
				)}
			</div>
		</div>
	);
}
