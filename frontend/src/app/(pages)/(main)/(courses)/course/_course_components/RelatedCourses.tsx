import { generateSlug } from "@/contexts/Callbacks";
import { CourseProps } from "@/types/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { LuBookOpen, LuClock } from "react-icons/lu";

export default function RelatedCourses({
	relatedCourses,
	getCategoryByObjectId,
}: {
	relatedCourses: CourseProps[];
	getCategoryByObjectId: (id: string) => string;
}) {
	return (
		<div>
			<h4 className="font-semibold mb-4 text-gray-800">
				Related Courses You Might Love
			</h4>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
				{relatedCourses?.map((course, index) => (
					<div
						key={index}
						className="group bg-white rounded-2xl shadow-sm shadow-purple-200 hover:shadow-md hover:shadow-purple-200 transition-all overflow-hidden flex flex-col transform hover:-translate-y-1"
					>
						<div className="relative overflow-hidden h-48">
							<div className="relative w-full h-full group-hover:scale-110 transition-transform duration-300">
								<Image
									src={
										course?.image?.[0]
											? `${process.env.NEXT_PUBLIC_MEDIA_URL}/course/${course?.image?.[0]}`
											: "/img/default-images/campusaim-courses-featured.png"
									}
									alt="Course Image"
									fill
									className="object-cover"
								/>
							</div>
							<span className="absolute top-3 right-3 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
								{course.course_type}
							</span>
						</div>
						<div className="p-6 flex flex-col flex-grow">
							<Link
								href={`/course/${generateSlug(course?.course_name)}`}
								className="text-lg font-semibold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors leading-tight"
							>
								{course?.course_name} ({course?.course_short_name})
							</Link>
							<div className="flex items-center justify-between text-sm text-gray-600 mb-4">
								<div className="flex items-center space-x-1">
									<span className="ml-1">
										{Array.isArray(course?.specialization) &&
											course.specialization.map((id) => (
												<span key={id} className="ml-1">
													{getCategoryByObjectId(id)}
												</span>
											))}
									</span>
								</div>
							</div>
							<div className="flex items-center justify-between text-sm text-gray-700 mt-auto pt-4 border-t border-gray-100">
								<div className="flex items-center space-x-1">
									<LuClock className="w-4 h-4" />
									<span>{course.duration}</span>
								</div>
								<div className="flex items-center space-x-1">
									<LuBookOpen className="w-4 h-4" />
									<span>
										{Array.isArray(course?.program_type) &&
											course.program_type.map((id) => (
												<span key={id} className="ml-1">
													{getCategoryByObjectId(id)}
												</span>
											))}
									</span>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
