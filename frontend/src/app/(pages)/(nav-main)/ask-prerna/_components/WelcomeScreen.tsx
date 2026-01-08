"use client";

import { motion } from "framer-motion";
import { LuMail } from "react-icons/lu";
import { ChatInput } from "./ChatInput";
import Image from "next/image";
import GoogleLoginButton from "@/app/(pages)/auth/_googleLogin/GoogleLoginButton";
import Link from "next/link";
import { UserProps } from "@/types/types";

interface WelcomeScreenProps {
	onStart: () => void;
	onSendMessage: (message: string) => void;
	token: string;
	hasStarted: boolean;
	authUser: UserProps | null | undefined;
}

export function WelcomeScreen({
	onStart,
	onSendMessage,
	token,
	hasStarted,
	authUser,
}: WelcomeScreenProps) {
	const userName = authUser?.name?.split(" ")?.[0] || "there";

	return (
		<div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-b from-white via-gray-50 to-gray-100">
			{/* Main Section */}
			<motion.div
				initial={{ opacity: 0, y: 25 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, ease: "easeOut" }}
				className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-6"
			>
				{/* Logo */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.2, duration: 0.7 }}
				>
					<div className="relative w-48 h-12 flex items-center justify-center overflow-hidden">
						<Image
							src="/img/logo/campusaim-logo.png"
							alt="Prerna Wellness Logo"
							fill
							className="object-contain"
							priority
						/>
					</div>
				</motion.div>

				{/* Heading */}
				<motion.h1
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 0.6 }}
					className="text-3xl md:text-4xl font-semibold text-gray-800 leading-snug"
				>
					Namaste, <span className="text-gray-700">{userName}!</span>
				</motion.h1>

				{/* Subheading */}
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6, duration: 0.6 }}
					className="text-base text-gray-600 max-w-2xl leading-relaxed"
				>
					I am <span className="font-semibold text-gray-900">Prerna</span>, your
					AI partner for yoga and wellness. I&apos;m here to help you compare
					studios, find courses, discover retreats, and answer any related
					question.
				</motion.p>

				{/* Third line */}
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8, duration: 0.6 }}
					className="text-lg text-gray-700 font-medium"
				>
					Ask Me Anything
				</motion.p>

				{/* Auth Buttons */}
				{!token && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 1, duration: 0.6 }}
						className="flex flex-col sm:flex-row gap-3 mt-2"
					>
						<GoogleLoginButton />
						<Link
							href="/auth/login"
							onClick={onStart}
							className="flex-1 gap-3 border border-gray-200 hover:bg-gray-100 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors shadow-sm px-5 py-3"
						>
							<LuMail className="w-5 h-5 text-gray-600" />
							<span className="hidden sm:inline text-gray-800">
								Continue with Email
							</span>
							<span className="sm:hidden text-gray-800">Email</span>
						</Link>
					</motion.div>
				)}

				{/* Small Footer Note */}
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1.2, duration: 0.8 }}
					className="text-sm text-gray-400 mt-4"
				>
					Take a moment — you’re exactly where you need to be
				</motion.p>
			</motion.div>

			{/* Chat Input */}
			<motion.div
				initial={{ opacity: 0, y: 25 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 1.4, duration: 0.6 }}
				className="pb-6"
			>
				<ChatInput onSendMessage={onSendMessage} hasStarted={hasStarted} />
			</motion.div>
		</div>
	);
}
