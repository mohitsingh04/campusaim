import React from "react";
import { LuAward, LuGraduationCap } from "react-icons/lu";
import { CourseProps } from "@/types/types";
import { generateSlug } from "@/contexts/Callbacks";
import Link from "next/link";
import Image from "next/image";
import { BsClock } from "react-icons/bs";
import { FaLevelUpAlt } from "react-icons/fa";

const CourseCard = ({
	course,
	isListView,
}: {
	isListView: boolean;
	course: CourseProps;
}) => {
	const slug = `/course/${course.course_slug}`;
	const imageSrc = course?.image?.[0]
		? `${process.env.NEXT_PUBLIC_MEDIA_URL}/course/${course?.image?.[0]}`
		: "/img/default-images/yp-yoga-courses.webp";

	return (
		<div
			className={`bg-white rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden group ${
				isListView ? "flex flex-col md:flex-row" : ""
			}`}
		>
			{/* Image Section */}
			<Link
				href={slug}
				className={`${
					isListView ? "w-full md:w-80 lg:w-96 flex-shrink-0" : ""
				}`}
			>
				<div
					className={`relative ${isListView ? "h-56 md:h-72" : "h-48 sm:h-56"}`}
				>
					<div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
						<Image
							src={imageSrc}
							alt={course.course_name || "course Image"}
							fill
							className="object-cover"
						/>
					</div>
				</div>
			</Link>

			{/* Details Section */}
			<div className="flex flex-col p-4 md:p-6 flex-1">
				{/* Title and Rating */}
				<div className="flex justify-between items-start mb-2">
					<Link href={slug}>
						<h3 className="text-lg sm:text-xl font-semibold text-gray-900 hover:text-purple-600 line-clamp-2">
							{course.course_name} ({course.course_short_name})
						</h3>
					</Link>
					<div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
						<BsClock className="w-4 h-4 text-yellow-400 mr-1" />
						<span className="text-xs text-nowrap font-medium">
							{course.duration}
						</span>
					</div>
				</div>

				<div className="flex items-center text-gray-600 text-sm mb-3 gap-2">
					<FaLevelUpAlt className="w-4 h-4 flex-shrink-0 text-purple-500" />
					<span className="truncate">
						Specialization - {course.specialization}
					</span>
				</div>

				{/* Category and Compare */}
				<div className="flex items-center text-gray-600 text-sm mb-3 gap-2">
					<LuGraduationCap className="w-4 h-4 flex-shrink-0 text-purple-500" />
					<span className="capitalize">{course.course_type}</span>
				</div>

				{/* Type and Establishment */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
					<div className="flex items-center">
						<LuAward className="w-4 h-4 mr-2 text-purple-500" />
						<span className="line-clamp-1">{course.program_type}</span>
					</div>
				</div>

				{/* View Details Button */}
				<Link
					href={slug}
					className="mt-auto block w-full text-center bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 hover:scale-[1.02] transition duration-200 font-medium text-sm sm:text-base shadow-lg"
				>
					View Details
				</Link>
			</div>
		</div>
	);
};

export default CourseCard;
