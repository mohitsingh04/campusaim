import { CourseProps } from "@/types/types";
import Image from "next/image";
import React from "react";
import { LuClock, LuGraduationCap } from "react-icons/lu";

const CourseDetailCard = ({
	course,
	getCategoryById,
}: {
	course: CourseProps | null | undefined;
	getCategoryById: any;
}) => {
	return (
		<div className="bg-white overflow-hidden sm:rounded-2xl sm:shadow-sm">
			{/* Banner Image */}
			<div className="aspect-video bg-red-900 relative overflow-hidden">
				<Image
					src={
						course?.image?.[0]
							? `${process.env.NEXT_PUBLIC_MEDIA_URL}/course/${course?.image?.[0]}`
							: "/img/default-images/campusaim-courses-featured.png"
					}
					alt="Course Featured Image"
					fill
					className="object-cover"
				/>
			</div>

			{/* Details */}
			<div className="p-4 md:p-6">
				<h1 className="text-lg md:text-2xl font-semibold text-gray-700 leading-tight mb-2">
					{course?.course_name} ({course?.course_short_name})
				</h1>

				<p className="text-gray-600 text-sm md:text-base mb-4">
					{getCategoryById(course?.specialization)}
				</p>

				<p className="text-gray-600 text-sm md:text-base mb-4">
					{getCategoryById(course?.program_type)}
				</p>

				{/* Info Fields */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-gray-700 text-sm">
					{course?.duration && (
						<div className="flex items-center whitespace-nowrap">
							<LuClock className="w-4 h-4 mr-2 text-purple-500 shrink-0" />
							<span className="truncate" title={course?.duration}>
								{course.duration}
							</span>
						</div>
					)}

					{Array.isArray(course?.certification_type) && (
						<span
							className="truncate"
							title={course.certification_type.join(", ")}
						>
							{course.certification_type.join(", ")}
						</span>
					)}

					{course?.course_type && (
						<div className="flex items-center whitespace-nowrap">
							<LuGraduationCap className="w-4 h-4 mr-2 text-purple-500 shrink-0" />
							<span className="truncate" title={course?.course_type}>
								{course.course_type}
							</span>
						</div>
					)}
				</div>

				{/* Enquiry Button */}
				{/* <div className="mt-8">
          <a
            href="#enquiry"
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold hover:opacity-90 transition"
          >
            Enquiry
          </a>
        </div> */}
			</div>
		</div>
	);
};

export default CourseDetailCard;
