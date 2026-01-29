import HeadingLine from "@/ui/headings/HeadingLine";
import Link from "next/link";

export default function PropertyMegaMenu({
	dropdownContent,
	activeDesktopSubMenu,
	setActiveDesktopSubMenu,
	onClose,
}: {
	dropdownContent: any;
	activeDesktopSubMenu: any;
	setActiveDesktopSubMenu: any;
	onClose: any;
}) {
	return (
		<div className="flex">
			{/* Left */}
			<div className="w-1/4 bg-(--main-emphasis)">
				<ul className="py-4">
					{Object.keys(dropdownContent).map((key) => (
						<li
							key={key}
							onMouseEnter={() => setActiveDesktopSubMenu(key)}
							className={`px-5 py-3 cursor-pointer ${
								activeDesktopSubMenu === key ? "font-semibold" : ""
							}`}
						>
							{key}
						</li>
					))}
				</ul>
			</div>

			{/* Right */}
			<div className="w-3/4 p-8 overflow-y-auto">
				{activeDesktopSubMenu &&
					Object.values(dropdownContent[activeDesktopSubMenu]).map(
						(section: any) => (
							<div key={section.title}>
								<HeadingLine title={section.title} />
								<ul>
									{section.links.map((l: any) => (
										<li key={l.name}>
											<Link href={l.href} onClick={onClose}>
												{l.name}
											</Link>
										</li>
									))}
								</ul>
							</div>
						),
					)}
			</div>
		</div>
	);
}
