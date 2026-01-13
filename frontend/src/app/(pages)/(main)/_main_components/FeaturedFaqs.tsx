"use client";
import React, { useState } from "react";
import { LuMinus, LuPlus } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const faqItems = [
	{
		id: "q1",
		question: "What is Campusaim?",
		answer:
			"Campusaim is an education discovery platform that helps students explore verified colleges and universities, compare courses, eligibility, fees, and admissions information in one place.",
	},
	{
		id: "q2",
		question: "Is Campusaim free to use?",
		answer:
			"Yes, Campusaim is free for students to explore colleges, courses, exams, and related information. Some advanced guidance or counseling features may be introduced in the future.",
	},
	{
		id: "q3",
		question: "How accurate is the college and course information?",
		answer:
			"We collect data from official college websites, regulatory bodies, and reliable public sources. Information is reviewed and updated regularly to ensure accuracy, though students should always verify final details with the institution.",
	},
	{
		id: "q4",
		question: "Can I apply to colleges directly through Campusaim?",
		answer:
			"Campusaim primarily focuses on helping students research and compare colleges. For most institutions, applications are completed through official college or exam portals. Application support features may be added in the future.",
	},
	{
		id: "q5",
		question: "Does Campusaim provide admission counseling?",
		answer:
			"Campusaim offers structured information to support decision-making. Dedicated counseling or personalized guidance services may be available depending on the institution or future platform updates.",
	},
	{
		id: "q6",
		question: "Who can use Campusaim?",
		answer:
			"Campusaim is designed for students, parents, and educators looking for clear, reliable information about colleges, universities, courses, entrance exams, and academic pathways.",
	},
];

export default function FeaturedFaq() {
	const [openId, setOpenId] = useState<string | null>(null);

	const toggleFaq = (id: string) => {
		setOpenId((prev) => (prev === id ? null : id));
	};

	return (
		<section className="relative overflow-hidden">
			{/* ✅ Grid layout: FAQ left, image right */}
			<div className="grid lg:grid-cols-2 min-h-[90vh]">
				{/* ✅ FAQ Section */}
				<div className="flex flex-col justify-center px-6 md:px-16 py-16 bg-white z-10 relative">
					<h2 className="text-4xl font-bold text-gray-800 mb-8 text-center lg:text-left">
						Frequently Asked Questions
					</h2>

					<div className="space-y-4">
						{faqItems.map(({ id, question, answer }) => {
							const isOpen = openId === id;
							return (
								<motion.div key={id} layout initial={{ borderRadius: 8 }}>
									<button
										onClick={() => toggleFaq(id)}
										className="flex justify-between items-center w-full px-6 py-3 text-left font-medium text-lg text-gray-800  hover:bg-gray-50 rounded-xl transition-colors"
									>
										<span>{question}</span>
										<motion.span
											animate={{ rotate: isOpen ? 180 : 0 }}
											transition={{ duration: 0.3 }}
											className="text-purple-600"
										>
											{!isOpen ? <LuPlus size={24} /> : <LuMinus />}
										</motion.span>
									</button>

									<AnimatePresence initial={false}>
										{isOpen && (
											<motion.div
												key="content"
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{ duration: 0.4, ease: "easeInOut" }}
												className="px-6 overflow-hidden bg-white rounded-b-xl shadow-sm"
											>
												<div className="py-3 text-gray-600">
													<p className="text-base leading-relaxed">{answer}</p>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</motion.div>
							);
						})}
					</div>
				</div>

				{/* ✅ Image Section */}
				<div className="relative order-2 lg:order-none w-full h-[300px] lg:h-auto">
					<Image
						src="/img/section-images/ca-faqs.webp"
						alt="FAQ Illustration"
						fill
						className="object-contain object-center"
						priority
					/>
				</div>
			</div>
		</section>
	);
}
