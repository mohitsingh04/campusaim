"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";

export default function Hero({ modalOpen }: { modalOpen: () => void }) {
	const [currentText, setCurrentText] = React.useState(0);

	const texts = React.useMemo(
		() => ["COLLEGES", "UNIVERSITIES", "SCHOOLS"],
		[]
	);

	const colors = React.useMemo(
		() => ["#235daf", "#9a39a7", "#00b6ff", "#ff050f"],
		[]
	);

	React.useEffect(() => {
		const interval = setInterval(() => {
			setCurrentText((prev) => (prev + 1) % texts.length);
		}, 3000);
		return () => clearInterval(interval);
	}, [texts]);

	return (
		<div className="min-h-screen relative overflow-hidden">
			{/* --- Background --- */}
			{/* <div
				className="absolute top-0 left-0 z-[-1] h-full bg-cover bg-center bg-no-repeat w-full md:w-1/4"
				style={{
					backgroundImage: "url('/img/section-images/yp-hero.webp')",
					backgroundPosition: "center right",
				}}
			/> */}

			{/* --- Main Hero Content --- */}
			<div className="container mx-auto px-4 h-screen flex items-center justify-center">
				<div className="w-full max-w-2xl flex flex-col items-center text-center space-y-8 relative z-10">
					<motion.img
						src={`/img/logo/campusaim-logo.png`}
						alt="Campusaim Logo"
						className="w-64 py-4"
						initial={{ opacity: 0, y: -50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, ease: "easeOut" }}
					/>

					<div className="w-full">
						<div className="flex flex-wrap justify-center items-center gap-2">
							<h1 className="text-3xl md:text-5xl font-medium">Easily Find </h1>
							<div className="h-[60px] overflow-hidden">
								<AnimatePresence mode="wait">
									<motion.h2
										key={currentText}
										initial={{ y: 50, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										exit={{ y: -50, opacity: 0 }}
										transition={{ duration: 0.5 }}
										className="text-4xl md:text-5xl mt-2 font-medium"
										style={{ color: colors[currentText] }}
									>
										{texts[currentText]}
									</motion.h2>
								</AnimatePresence>
							</div>
						</div>
					</div>

					<motion.div
						className="w-full bg-white rounded-full shadow-sm px-4 py-2"
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						onClick={modalOpen}
					>
						<div className="flex flex-col sm:flex-row items-center gap-2">
							<input
								type="text"
								placeholder="Search Colleges, Universities, Course, Scholarships..."
								className="w-full outline-none text-sm px-2 py-2 sm:py-1 rounded-full"
							/>
							<button className="w-full sm:w-auto bg-purple-600 rounded-full cursor-pointer text-white px-6 py-2 flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors">
								<FaSearch className="w-4 h-4" />
								<span>Search</span>
							</button>
						</div>
					</motion.div>

					<motion.div
						className="flex flex-wrap justify-center gap-4 px-4 md:px-0 mt-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.6 }}
					>
						{[
							"Colleges",
							"Universities",
							"Courses",
							"Schools",
							"Exams",
							"Scholarship",
						].map((link, index) => (
							<motion.a
								key={link}
								href="#"
								className="px-4 py-1 bg-white rounded-full text-purple-600 hover:text-purple-800 transition-all duration-300 shadow-sm text-sm md:text-base"
								whileHover={{ scale: 1.05, y: -2 }}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: 0.1 * index }}
							>
								{link}
							</motion.a>
						))}
					</motion.div>
				</div>
			</div>
		</div>
	);
}
