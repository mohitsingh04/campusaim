"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
	MessageCircle,
	Share2,
	Eye,
	Clock,
	Trash,
	Ellipsis,
	Link2,
} from "lucide-react";
import {
	FaArrowAltCircleDown,
	FaArrowAltCircleUp,
	FaBookmark,
	FaRegArrowAltCircleDown,
	FaRegArrowAltCircleUp,
	FaRegBookmark,
} from "react-icons/fa";
import ProtectedButton from "@/components/common/Button/ProtectedButton";
import { formatDistanceToNow } from "date-fns";
import { Question, User } from "@/config/Types";
import ShareModal from "../modal/ShareModal";

const getInitials = (name = "") =>
	name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((n) => n[0]?.toUpperCase())
		.join("") || "U";
export default function QuestionCard({
	question,
	author,
	answersCount,
	onUpvote,
	onDownvote,
	onFollow,
	onUnfollow,
	onDelete,
	onCopyLink,
	isFollowing,
	hasUpvoted,
	hasDownvoted,
	authUserId,
}: {
	question: Question;
	author: User | undefined;
	answersCount: number;
	onUpvote: () => void;
	onDownvote: () => void;
	onFollow: () => void;
	onUnfollow: () => void;
	onDelete: () => void;
	onShare: () => void;
	onCopyLink: () => void;
	isFollowing: boolean;
	hasUpvoted: boolean;
	hasDownvoted: boolean;
	authUserId?: string;
}) {
	const [shareOpen, setShareOpen] = useState(false);

	const shareUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/question/${question.slug}`
			: `${process.env.NEXT_PUBLIC_BASE_URL}/question/${question.slug}`;

	return (
		<div className="group m-2 flex flex-col sm:flex-row rounded-xl bg-white shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all">
			{/* LEFT — VOTE PANEL (Desktop Only) */}
			<div className="hidden sm:flex flex-col">
				<div className="flex flex-col sm:w-16 items-center justify-start bg-gray-50 rounded-l-xl p-3">
					{/* Upvote */}
					<ProtectedButton
						onClick={onUpvote}
						className={`p-2 rounded-lg transition ${
							hasUpvoted
								? "text-emerald-600 bg-emerald-50"
								: "text-gray-500 hover:text-emerald-600 hover:bg-gray-100"
						}`}
					>
						{hasUpvoted ? (
							<FaArrowAltCircleUp className="h-5 w-5" />
						) : (
							<FaRegArrowAltCircleUp className="h-5 w-5" />
						)}
					</ProtectedButton>

					{/* Upvote Count */}
					<span className="text-sm font-semibold text-gray-700 mt-1">
						{question.upvotes ?? 0}
					</span>

					{/* Divider */}
					<div className="my-2 h-px w-6 bg-gray-200" />

					{/* Downvote */}
					<ProtectedButton
						onClick={onDownvote}
						className={`p-2 rounded-lg transition ${
							hasDownvoted
								? "text-red-600 bg-red-50"
								: "text-gray-500 hover:text-red-600 hover:bg-gray-100"
						}`}
					>
						{hasDownvoted ? (
							<FaArrowAltCircleDown className="h-5 w-5" />
						) : (
							<FaRegArrowAltCircleDown className="h-5 w-5" />
						)}
					</ProtectedButton>

					{/* Downvote Count */}
					<span className="text-sm font-semibold text-gray-700 mt-1">
						{question.downvotes ?? 0}
					</span>
				</div>
			</div>

			{/* RIGHT — CONTENT */}
			<div className="flex-1 p-5 sm:p-6">
				{/* Author Section */}
				<div className="flex items-start gap-3">
					{author?.avatar?.[0] ? (
						<Image
							src={
								author.avatar[0].startsWith("http")
									? author.avatar[0]
									: `${process.env.NEXT_PUBLIC_MEDIA_URL}/${author.avatar[0]}`
							}
							alt={author?.name || "User"}
							width={38}
							height={38}
							className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-300"
						/>
					) : (
						<span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700 ring-1 ring-gray-300">
							{getInitials(author?.name)}
						</span>
					)}

					<div className="flex-1">
						<div className="flex justify-between">
							<div>
								<Link
									href={`/profile/${author?.username}`}
									target="_blank"
									className="font-semibold text-gray-900 hover:text-purple-600"
								>
									{author?.name}
								</Link>
								<p className="text-xs text-gray-500">Author</p>
							</div>

							<div className="flex items-center gap-1 text-xs text-gray-500">
								<Clock className="h-4 w-4" />
								{question.createdAt
									? formatDistanceToNow(new Date(question.createdAt), {
											addSuffix: true,
									  })
									: "just now"}
							</div>
						</div>
					</div>
				</div>

				{/* Title */}
				<Link href={`/question/${question.slug}`} prefetch>
					<h2 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-purple-600 leading-snug">
						{question.title}
					</h2>
				</Link>

				{/* Description */}
				<div
					className="prose prose-sm text-gray-700 mt-2 line-clamp-3"
					dangerouslySetInnerHTML={{ __html: question.description || "" }}
				/>

				{/* Tags */}
				<div className="mt-4 flex flex-wrap gap-2">
					{Array.isArray(question.category) &&
						question.category.map((cat) => (
							<Link href={`/topic/${cat.slug}`} target="blank" key={cat._id}>
								<span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 border border-purple-200">
									{cat.category_name}
								</span>
							</Link>
						))}
				</div>

				{/* Footer Stats */}
				<div className="mt-5 border-t pt-4 text-sm text-gray-600">
					{/* MOBILE: stats + ellipsis in one row */}
					<div className="flex sm:hidden justify-between items-center w-full">
						{/* Stats */}
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-1">
								<MessageCircle className="h-4 w-4" />
								<Link
									href={`/question/${question.slug}`}
									className="hover:underline"
								>
									{answersCount} Answers
								</Link>
							</div>

							<div className="flex items-center gap-1">
								<Eye className="h-4 w-4" />
								<Link
									href={`/question/${question.slug}`}
									className="hover:underline"
								>
									{question.views || 0} Views
								</Link>
							</div>
						</div>

						{/* Ellipsis Button (Moved to Right) */}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild>
								<button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700">
									<Ellipsis className="h-5 w-5" />
								</button>
							</DropdownMenu.Trigger>

							<DropdownMenu.Content className="z-50 min-w-[160px] rounded-lg bg-white shadow-xl p-1 border border-gray-200">
								<DropdownMenu.Item asChild>
									<ProtectedButton
										onClick={isFollowing ? onUnfollow : onFollow}
										className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 ${
											isFollowing ? "text-red-600" : "text-gray-700"
										}`}
									>
										{isFollowing ? <FaBookmark /> : <FaRegBookmark />}
										{isFollowing ? "Unfollow" : "Follow"}
									</ProtectedButton>
								</DropdownMenu.Item>

								<DropdownMenu.Item
									onSelect={() => setShareOpen(true)}
									className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer hover:bg-gray-100"
								>
									<Share2 className="h-4 w-4" /> Share
								</DropdownMenu.Item>

								<DropdownMenu.Item
									onSelect={onCopyLink}
									className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer hover:bg-gray-100"
								>
									<Link2 className="h-4 w-4" /> Copy Link
								</DropdownMenu.Item>

								{/* Delete */}
								{authUserId &&
									(typeof question.author === "string"
										? question.author
										: question.author?._id) === authUserId && (
										<DropdownMenu.Item
											onSelect={onDelete}
											className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer hover:bg-red-50 text-red-600"
										>
											<Trash className="h-4 w-4" /> Delete
										</DropdownMenu.Item>
									)}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>

					{/* DESKTOP (unchanged layout) */}
					<div className="hidden sm:flex justify-between items-center">
						{/* Stats */}
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-1">
								<MessageCircle className="h-4 w-4" />
								<Link
									href={`/question/${question.slug}`}
									className="hover:underline"
								>
									{answersCount} Answers
								</Link>
							</div>

							<div className="flex items-center gap-1">
								<Eye className="h-4 w-4" />
								<Link
									href={`/question/${question.slug}`}
									className="hover:underline"
								>
									{question.views || 0} Views
								</Link>
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-2">
							<div className="mt-2 sm:mt-0 flex items-center gap-2">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger asChild>
										<button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700">
											<Ellipsis className="h-5 w-5" />
										</button>
									</DropdownMenu.Trigger>

									<DropdownMenu.Content className="z-50 min-w-[160px] rounded-lg bg-white shadow-xl p-1 border border-gray-200">
										<DropdownMenu.Item asChild>
											<ProtectedButton
												onClick={isFollowing ? onUnfollow : onFollow}
												className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 ${
													isFollowing ? "text-red-600" : "text-gray-700"
												}`}
											>
												{isFollowing ? <FaBookmark /> : <FaRegBookmark />}
												{isFollowing ? "Unfollow" : "Follow"}
											</ProtectedButton>
										</DropdownMenu.Item>

										<DropdownMenu.Item
											onSelect={() => setShareOpen(true)}
											className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer hover:bg-gray-100"
										>
											<Share2 className="h-4 w-4" /> Share
										</DropdownMenu.Item>

										<DropdownMenu.Item
											onSelect={onCopyLink}
											className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer hover:bg-gray-100"
										>
											<Link2 className="h-4 w-4" /> Copy Link
										</DropdownMenu.Item>

										{/* Delete if owner */}
										{authUserId &&
											(typeof question.author === "string"
												? question.author
												: question.author?._id) === authUserId && (
												<DropdownMenu.Item
													onSelect={onDelete}
													className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer hover:bg-red-50 text-red-600"
												>
													<Trash className="h-4 w-4" /> Delete
												</DropdownMenu.Item>
											)}
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>
						</div>
					</div>
				</div>

				{/* MOBILE — QUORA STYLE VOTE BAR (BOTTOM) */}
				<div className="flex sm:hidden items-center justify-between bg-gray-50 rounded-xl px-4 py-2 text-sm shadow-sm border border-gray-200 mt-4">
					<button
						onClick={onUpvote}
						className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition ${
							hasUpvoted
								? "text-purple-600 bg-purple-50 border border-purple-200"
								: "text-gray-600 bg-white border border-gray-200 hover:bg-gray-100"
						}`}
					>
						{hasUpvoted ? (
							<FaArrowAltCircleUp className="h-4 w-4" />
						) : (
							<FaRegArrowAltCircleUp className="h-4 w-4" />
						)}
						<span>Upvote • {question.upvotes ?? 0}</span>
					</button>

					<button
						onClick={onDownvote}
						className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition ${
							hasDownvoted
								? "text-red-600 bg-red-50 border border-red-200"
								: "text-gray-600 bg-white border border-gray-200 hover:bg-gray-100"
						}`}
					>
						{hasDownvoted ? (
							<FaArrowAltCircleDown className="h-4 w-4" />
						) : (
							<FaRegArrowAltCircleDown className="h-4 w-4" />
						)}
						<span>{question.downvotes ?? 0}</span>
					</button>
				</div>
			</div>

			{/* Share Modal */}
			<ShareModal
				open={shareOpen}
				onClose={() => setShareOpen(false)}
				url={shareUrl}
				title={question.title}
			/>
		</div>
	);
}
