import { generateSlug } from "@/contexts/Callbacks";
import Image from "next/image";
import Link from "next/link";
import {
	FaXTwitter,
	FaLinkedinIn,
	FaFacebookF,
	FaYoutube,
	FaInstagram,
} from "react-icons/fa6";

export default function Footer() {
	return (
		<div>
			<footer className="bg-gray-900 text-gray-400 px-6 py-16 md:px-20">
				<div className="max-w-7xl mx-auto">
					<div className="text-center max-w-2xl mx-auto mb-12">
						<div className="relative h-12 w-52 mx-auto mb-6">
							<Image
								src="/img/logo/campusaim-logo.png"
								alt="Campusaim Logo"
								fill
								className="object-contain"
							/>
						</div>
						<p className="text-gray-300 text-sm leading-relaxed">
							At Yogprerna, we make group workouts exciting, healthy eating
							delicious, and mental wellness effortless with yoga & meditation.
						</p>

						{/* Social Icons */}
						<div className="flex justify-center items-center gap-4 mt-6">
							{[
								{
									icon: <FaXTwitter />,
									href: "https://x.com/PrernaYog40326",
									label: "Twitter",
								},
								{
									icon: <FaLinkedinIn />,
									href: "https://www.linkedin.com/company/yogprerna",
									label: "LinkedIn",
								},
								{
									icon: <FaFacebookF />,
									href: "https://www.facebook.com/yogprernaofficial",
									label: "Facebook",
								},
								{
									icon: <FaYoutube />,
									href: "https://www.youtube.com/@yogprerna108",
									label: "YouTube",
								},
								{
									icon: <FaInstagram />,
									href: "https://www.instagram.com/yog_prerna/",
									label: "Instagram",
								},
							].map((item, index) => (
								<a
									key={index}
									href={item.href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={item.label}
									className="text-gray-400 hover:text-white text-xl transition-colors duration-200"
								>
									{item.icon}
								</a>
							))}
						</div>
					</div>

					{/* Footer Grid Links */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 text-center">
						<div>
							<h3 className="text-lg font-semibold mb-3">LOCATION</h3>
							<ul className="space-y-2 text-sm text-gray-500">
								{[
									{
										title: "Rishikesh",
										href: "/yoga-institutes?country=india&state=uttarakhand&city=rishikesh",
									},
									{
										title: "Dehradun",
										href: "/yoga-institutes?country=india&state=uttarakhand&city=dehradun",
									},
									{
										title: "Bengaluru",
										href: "/yoga-institutes?country=india&state=karnataka&city=bengaluru",
									},
									{
										title: "Mysuru",
										href: "/yoga-institutes?country=india&state=karnataka&city=mysuru",
									},
								].map((loc, index) => (
									<li key={index}>
										<Link
											href={loc.href}
											className="hover:text-gray-400 transition-all duration-200"
										>
											{loc.title}
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h3 className="text-lg font-semibold mb-3">YOGA BY CATEGORY</h3>
							<ul className="space-y-2 text-sm text-gray-500">
								{[
									{ title: "University" },
									{ title: "College" },
									{ title: "Yoga Studio" },
									{ title: "Online Yoga Studio" },
								].map((item, index) => (
									<li key={index}>
										<Link
											href={`/yoga-institutes?category=${generateSlug(
												item.title || ""
											)}`}
											className="hover:text-gray-400 transition-all duration-200"
										>
											{item.title}
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h3 className="text-lg font-semibold mb-3">YYT PROGRAMS</h3>
							<ul className="space-y-2 text-sm text-gray-500">
								{[
									{
										title: "100 Hour YTT",
										href: "/course/100-hour-yoga-teacher-training",
									},
									{
										title: "200 Hour YTT",
										href: "/course/200-hour-yoga-teacher-training",
									},
									{
										title: "300 Hour YTT",
										href: "/course/300-hour-yoga-teacher-training",
									},
									{
										title: "500 Hour YTT",
										href: "/course/500-hour-yoga-teacher-training",
									},
									{
										title: "700 Hour YTT",
										href: "/course/700-hour-yoga-teacher-certification",
									},
								].map((item, index) => (
									<li key={index}>
										<a
											href={item.href}
											className="hover:text-gray-400 transition-all duration-200"
										>
											{item.title}
										</a>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h3 className="text-lg font-semibold mb-3">RETREAT PROGRAMS</h3>
							<ul className="space-y-2 text-sm text-gray-500">
								{[
									"4 day yoga retreat",
									"7 day yoga retreat",
									"10 day yoga retreat",
									"14 day yoga retreat",
								].map((item) => (
									<li key={item}>
										<a
											href="#"
											className="hover:text-gray-400 transition-all duration-200"
										>
											{item}
										</a>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h3 className="text-lg font-semibold mb-3">Quick Links</h3>
							<ul className="space-y-2 text-sm text-gray-500">
								{[
									{ title: "Home", href: "/" },
									{ title: "College & Universities", href: "/colleges" },
									{ title: "Course", href: "/courses" },
									{ title: "Blog", href: "/blog" },
									{ title: "Exams", href: "/exams" },
									{ title: "Scholarship", href: "/scholarship" },
								].map((item, index) => (
									<li key={index}>
										<Link
											href={item.href}
											className="hover:text-gray-400 transition-all duration-200"
										>
											{item.title}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>

				{/* Bottom Section */}
				<div className="border-t border-gray-300 mt-12 pt-6 text-sm text-gray-400 text-center">
					<p className="mb-3">
						&copy; 2025{" "}
						<a
							href={process.env.NEXT_PUBLIC_BASE_URL}
							className="text-gray-200 hover:text-gray-500 font-semibold"
						>
							Campusaim
						</a>
						. All rights reserved.
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						{[
							{ label: "Terms And Conditions", href: "terms-and-conditions" },
							{ label: "Privacy Policy", href: "privacy-policy" },
							{ label: "Disclaimer", href: "disclaimer" },
							{ label: "Cancellation Policy", href: "cancellation-policy" },
							{ label: "Cookies", href: "cookies" },
						].map((item, index) => (
							<Link
								key={index}
								href={`/${item.href}`}
								className="text-gray-500 hover:text-gray-400 transition-all"
							>
								{item.label}
							</Link>
						))}
					</div>
				</div>
			</footer>
		</div>
	);
}
