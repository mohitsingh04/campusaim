import BadgeBorder from "@/ui/badge/BadgeBorder";
import Image from "next/image";

export default function VisionSection() {
	return (
		<section className="relative py-14 px-4 sm:px-8 bg-(--primary-bg) overflow-hidden">
			<div className="relative grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-8 items-center">
				{/* Image – FIRST on mobile, SECOND on desktop */}
				<div className="relative w-full aspect-square order-1 md:order-2 flex justify-center items-center">
					<div className="relative w-full max-w-sm aspect-square">
						<Image
							src="/img/main-images/yp-vision.png"
							alt="Campusaim Vision"
							fill
							className="object-cover rounded-custom shadow-custom"
						/>
					</div>
				</div>

				{/* Content */}
				<div className="space-y-6 col-span-2 order-2 md:order-1">
					<BadgeBorder label="Our Vision" />

					<h2 className="heading-lg mb-4 text-(--text-color-emphasis) font-semibold">
						Bridging the gap between ancient wisdom, academic rigor, and modern
						life.
					</h2>

					<div className="space-y-5 text-pretty text-(--text-color-muted)">
						<p>
							In an education landscape often crowded with fragmented
							information and unverified claims, making the right academic
							choice can be overwhelming. Campusaim is built to bring clarity
							and integrity to this process. More than a simple directory, we
							are creating a trusted education platform where reliable data,
							verified institutions, and transparent information help students
							make confident, informed decisions—without unnecessary noise.
						</p>

						<p>
							We are redefining how students approach higher education
							decisions. For too long, critical academic choices have been
							influenced by incomplete information or marketing-driven
							narratives. Campusaim envisions a future where the academic value,
							institutional credibility, and long-term outcomes of education are
							clearly understood and accessible to every student.
						</p>

						<p>
							Transparency is the foundation of our platform. We believe
							students and parents deserve access to factual, verifiable
							information—free from exaggeration or bias. Campusaim provides
							clear tools to compare institutions, evaluate courses, understand
							eligibility, and review key academic details with confidence.
						</p>

						<p>
							Our mission extends beyond listings and search results. By
							supporting informed decision-making and promoting clarity in
							higher education, we aim to contribute to a stronger academic
							ecosystem—one where students choose the right institutions,
							institutions attract the right learners, and education leads to
							meaningful academic and career outcomes.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
