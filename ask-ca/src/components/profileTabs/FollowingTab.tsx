import React from "react";
import { User } from "@/config/Types";
import Image from "next/image";
import Link from "next/link";

interface FollowingTabProps {
	user: User | null;
	followingCount: number;
	following: User[];
}

const getInitials = (name = "") =>
	name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((n) => n[0]?.toUpperCase())
		.join("") || "U";

export default function FollowingTab({
	followingCount,
	following,
}: FollowingTabProps) {
	return (
		<section className="w-full">
			<header className="mb-4">
				<h2 className="text-xl font-semibold text-gray-800">
					{followingCount} Following
				</h2>
				<hr className="mt-2 border-gray-200" />
			</header>

			{following.length === 0 ? (
				<div className="flex items-center justify-center h-32">
					<p className="text-sm text-gray-500 italic">No Following yet.</p>
				</div>
			) : (
				<ul className="space-y-3">
					{following.map((item) => (
						<li
							key={item._id}
							className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-blue-300"
						>
							{item?.avatar?.[0] ? (
								<Image
									src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${item?.avatar?.[0]}`}
									alt={item?.name || "User"}
									width={32}
									height={32}
									className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200"
								/>
							) : (
								<span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-800 ring-1 ring-gray-300">
									{getInitials(item?.name)}
								</span>
							)}
							<div>
								<Link href={`/profile/${item.username}`} target="blank" prefetch={true}>
									<p className="text-sm font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
										{item.name || "Unnamed User"}
									</p>
								</Link>
								<p className="text-xs text-gray-500">@{item.username}</p>
							</div>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
