"use client";
import React from "react";
import StatsSection from "./_about_components/StatsSection";
import VisionSection from "./_about_components/Vision";
import MissionSection from "./_about_components/MissionSection";
import YogaTimeline from "./_about_components/Story";

const AboutUs = () => {
	return (
		<div className="relative bg-(--primary-bg) text-(--text-color) overflow-hidden">
			<div className="px-4 sm:px-8 py-14 ">
				<div className="relative ">
					<h1 className="text-4xl sm:text-5xl md:text-6xl max-w-3xl">
						About <span className="text-(--main)">Campusaim</span>
					</h1>
					<div className="mt-6 mb-10 w-84 h-[2px] bg-gradient-to-r from-(--main) to-transparent" />

					<div className="space-y-6 max-w-3xl">
						<p className="leading-relaxed">
							Campusaim is a structured education discovery platform designed to
							support students in exploring colleges, courses, and academic
							pathways with clarity and confidence.
						</p>

						<p className="leading-relaxed">
							What started as an effort to simplify college research has evolved
							into a structured platform connecting students with colleges,
							universities, courses, entrance exams, and academic
							opportunities—built on reliable data and designed for today’s
							education landscape.
						</p>
					</div>

					<div className="relative mt-14 max-w-2xl pl-6 border-l-2 border-(--main)/40">
						<p className="font-medium leading-relaxed">
							Education is more than choosing a college.
							<span className="block mt-2 text-(--main)">
								It is about making informed, responsible decisions that shape
								your future.
							</span>
						</p>
					</div>
				</div>
			</div>

			<StatsSection />
			<VisionSection />
			<MissionSection />
			<YogaTimeline />
		</div>
	);
};

export default AboutUs;
