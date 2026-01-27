// MissionSection.tsx

import BadgeBorder from "@/ui/badge/BadgeBorder";
import Image from "next/image";

export default function MissionSection() {
	return (
		<section className="relative py-14 px-4 sm:px-8 bg-(--primary-bg) overflow-hidden">
			<div className="relative  grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-8 items-center">
				<div className="relative group w-full aspect-square col-span-1">
					<Image
						src="/img/main-images/yp-mission.png"
						alt="Campusaim Mission"
						fill
						className="w-full h-full object-cover rounded-custom shadow-custom"
					/>
				</div>

				<div className="col-span-2 space-y-6">
					<BadgeBorder label="Our Mission" />

					<h2 className="heading-lg mb-4 text-(--text-color-emphasis) font-semibold">
						Bringing clarity and trust to higher education discovery.
					</h2>

					<div className="space-y-5 text-pretty text-(--text-color-muted)">
						<p>
							Our primary mission is to address the lack of clarity and
							credibility in higher education information. Campusaim goes beyond
							a basic listing platform by prioritizing accuracy and
							verification. We carefully review institutional details, course
							information, and publicly available accreditation data to ensure
							students access information that reflects reality—not marketing
							claims.
						</p>

						<p>
							We are also committed to strengthening the academic
							decision-making process. Higher education is a long-term
							investment, and choosing the right institution requires more than
							surface-level details. Campusaim helps students identify colleges,
							universities, and formal degree or diploma programs that align
							with recognized academic standards and regulatory frameworks.
						</p>

						<p>
							Ultimately, our goal is to simplify complex choices. Through
							structured comparisons and transparent information, we provide
							students with the clarity needed to evaluate options
							confidently—saving time, reducing uncertainty, and supporting
							informed academic decisions.
						</p>
					</div>

					<ul className="space-y-4 list-disc list-inside pt-2 text-lg font-medium text-(--text-color-emphasis)">
						<li>
							Verified institutional and course information from reliable
							sources
						</li>
						<li>
							Clear visibility into recognized degrees, diplomas, and programs
						</li>
						<li>
							Tools to compare colleges, courses, and key academic details
						</li>
					</ul>
				</div>
			</div>
		</section>
	);
}
