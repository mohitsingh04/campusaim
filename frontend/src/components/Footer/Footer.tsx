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
							At Campusaim, we help students discover verified colleges and
							universities, explore courses and eligibility, and make informed
							academic decisions with reliable data.
						</p>

						{/* Social Icons */}
						<div className="flex justify-center items-center gap-4 mt-6">
							{[
								{
									icon: <FaXTwitter />,
									href: "https://x.com/campusaim",
									label: "Twitter",
								},
								{
									icon: <FaLinkedinIn />,
									href: "https://www.linkedin.com/company/campusaim",
									label: "LinkedIn",
								},
								{
									icon: <FaFacebookF />,
									href: "https://www.facebook.com/campusaim",
									label: "Facebook",
								},
								{
									icon: <FaYoutube />,
									href: "https://www.youtube.com/@campusaim108",
									label: "YouTube",
								},
								{
									icon: <FaInstagram />,
									href: "https://www.instagram.com/campusaim/",
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
