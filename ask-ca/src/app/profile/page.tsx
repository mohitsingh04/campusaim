"use client";
import { API } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import type { TopUser, User } from "@/config/Types";
import Link from "next/link";
import Image from "next/image";

// Helper for unwrapping API responses
function unwrapArray<T>(res: { data?: T[] | { data?: T[] } }): T[] {
	const d = res?.data;
	if (Array.isArray(d)) return d as T[];
	if (Array.isArray((d as { data?: T[] })?.data))
		return (d as { data?: T[] }).data as T[];
	return [];
}

export default function Users() {
	const { data: users = [] } = useQuery({
		queryKey: ["users"],
		queryFn: () => API(`/users`).then(unwrapArray<User>),
	});

	// Fetch top-users
	const { data: topUsers = [] } = useQuery({
		queryKey: ["topUsers"],
		queryFn: () => API(`/top-users`).then(unwrapArray<TopUser>),
	});

	return (
		<div className="mx-auto max-w-6xl px-2 sm:px-4 py-4">
			{/* Main grid */}
			<div className="flex flex-col md:flex-row gap-6">
				{/* 1 */}
				<div className="w-full md:w-8/12">
					<div className="bg-white rounded-xl shadow border border-gray-200 p-4 max-w-md mx-auto md:mx-0">
						<h2 className="text-lg font-bold mb-4 text-gray-900">Users</h2>
						<ul className="divide-y divide-gray-100">
							{users &&
								users.map((userObj) => {
									const user = userObj;
									return (
										<li key={user._id} className="flex items-center gap-4 py-3">
											<Link
												href={`/profile/${user.username}`}
												className="flex items-center gap-4 flex-1 group"
												target="blank"
											>
												{user.avatar?.[0] ? (
													<Image
														src={
															user.avatar[0].startsWith("http")
																? user.avatar[0]
																: `${process.env.NEXT_PUBLIC_MEDIA_URL}/${user.avatar[0]}`
														}
														alt={user.name || "User"}
														width={40}
														height={40}
														className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-200 group-hover:ring-purple-400 transition"
													/>
												) : (
													<span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-base font-bold text-gray-700 ring-2 ring-purple-200 group-hover:ring-purple-400 transition">
														{user.name?.[0]?.toUpperCase() || "U"}
													</span>
												)}
												<div className="flex-1 min-w-0">
													<p className="font-semibold text-gray-900 truncate group-hover:text-purple-700 transition">
														{user.name}
													</p>
													<p className="text-xs text-gray-500 truncate">
														@{user.username}
													</p>
												</div>
											</Link>
										</li>
									);
								})}
						</ul>
					</div>
				</div>
				{/* 2 */}
				<div className="w-full md:w-4/12">
					<div className="bg-white rounded-xl shadow border border-gray-200 p-4 max-w-md mx-auto md:mx-0">
						<h2 className="text-lg font-bold mb-4 text-gray-900">Top Users</h2>
						<ul className="divide-y divide-gray-100">
							{topUsers &&
								topUsers.map((userObj) => {
									const user = userObj.user;
									return (
										<li key={user._id} className="flex items-center gap-4 py-3">
											<Link
												href={`/profile/${user.username}`}
												className="flex items-center gap-4 flex-1 group"
												target="blank"
											>
												{user.avatar?.[0] ? (
													<Image
														src={
															user.avatar[0].startsWith("http")
																? user.avatar[0]
																: `${process.env.NEXT_PUBLIC_MEDIA_URL}/${user.avatar[0]}`
														}
														alt={user.name || "User"}
														width={40}
														height={40}
														className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-200 group-hover:ring-purple-400 transition"
													/>
												) : (
													<span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-base font-bold text-gray-700 ring-2 ring-purple-200 group-hover:ring-purple-400 transition">
														{user.name?.[0]?.toUpperCase() || "U"}
													</span>
												)}
												<div className="flex-1 min-w-0">
													<p className="font-semibold text-gray-900 truncate group-hover:text-purple-700 transition">
														{user.name}
													</p>
													<p className="text-xs text-gray-500 truncate">
														@{user.username}
													</p>
												</div>
											</Link>
											<div className="flex flex-col items-end">
												<span className="text-base font-bold text-purple-600">
													{userObj.score}
												</span>
												<span className="text-xs text-gray-400">Score</span>
											</div>
										</li>
									);
								})}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
