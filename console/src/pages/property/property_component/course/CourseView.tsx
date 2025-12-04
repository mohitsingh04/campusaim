import { getStatusColor } from "../../../../contexts/Callbacks";
import Badge from "../../../../ui/badge/Badge";

interface CourseViewProps {
	course: {
		course_type: string;
		course_name: string;
		course_short_name: string;
		duration: string;
		description: string;
		course_level: string;
		course_slug: string;
		image: string[];
		status: string;
		best_for: string[];
		course_id: string;
		specialization: string[];
		program_type: string[];
		course_eligibility: string;
	};
	getCourseById: (id: string) => any;
	setIsViewing: any;
	getCategoryById: (id: string) => any;
}

export default function CourseView({
	course,
	getCourseById,
	setIsViewing,
	getCategoryById,
}: CourseViewProps) {
	const masterCourse = getCourseById(course?.course_id);

	const courseData = {
		name: course?.course_name || masterCourse?.course_name,
		shortName: course?.course_short_name || masterCourse?.course_short_name,
		specialization: course?.specialization || masterCourse?.specialization,
		course_type: course?.course_type || masterCourse?.course_type,
		program_type: course?.program_type || masterCourse?.program_type,
		duration: course?.duration || masterCourse?.duration,
		course_eligibility: course?.course_eligibility || masterCourse?.course_eligibility,
		status: course?.status || masterCourse?.status,
		bestFor: course?.best_for || masterCourse?.best_for,
	};

	const getCategoryNamesFromBestFor = (bestFor: any) => {
		if (!bestFor) return [];
		if (
			Array.isArray(bestFor) &&
			bestFor.length > 0 &&
			typeof bestFor[0] === "object"
		) {
			return bestFor
				.map((b: any) => b.category_name || b.name || b._id)
				.filter(Boolean);
		}
		if (Array.isArray(bestFor)) {
			return bestFor.map((id: string) => getCategoryById(id));
		}
		if (typeof bestFor === "string") {
			return [getCategoryById(bestFor)];
		}
		return [];
	};

	return (
		<div className="p-2">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-[var(--yp-text-primary)]">
					Course Details
				</h1>
				<button
					onClick={() => setIsViewing(null)}
					className="px-3 py-1.5 bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)] rounded-md font-medium text-sm hover:bg-[var(--yp-blue-hover)] transition"
				>
					&larr; Back
				</button>
			</div>

			<div className="overflow-x-auto">
				<table className="min-w-full bg-[var(--yp-secondary)] rounded-lg shadow-md divide-y divide-[var(--yp-border-primary)]">
					<tbody className="divide-y divide-[var(--yp-border-primary)]">
						<tr>
							<td className="px-6 py-4 font-medium text-[var(--yp-muted)]">
								Course Name
							</td>
							<td className="px-6 py-4 text-[var(--yp-text-primary)]">
								{courseData.name}
							</td>
						</tr>
						<tr className="bg-[var(--yp-secondary-alt)]">
							<td className="px-6 py-4 font-medium text-[var(--yp-muted)]">
								Short Name
							</td>
							<td className="px-6 py-4 text-[var(--yp-text-primary)]">
								{courseData.shortName}
							</td>
						</tr>
						<tr>
							<td className="px-6 py-4 font-medium text-[var(--yp-muted)]">
								Specialization
							</td>
							<td className="px-6 py-4 text-[var(--yp-text-primary)]">
								{getCategoryNamesFromBestFor(course?.specialization).join(", ")}
							</td>
						</tr>
						<tr>
							<td className="px-6 py-4 font-medium text-[var(--yp-muted)]">
								Course Type
							</td>
							<td className="px-6 py-4 text-[var(--yp-text-primary)]">
								{courseData.course_type}
							</td>
						</tr>
						<tr>
							<td className="px-6 py-4 font-medium text-[var(--yp-muted)]">
								Program Type
							</td>
							<td className="px-6 py-4 text-[var(--yp-text-primary)]">
								{getCategoryNamesFromBestFor(course?.program_type).join(", ")}
							</td>
						</tr>
						<tr className="bg-[var(--yp-secondary-alt)]">
							<td className="px-6 py-4 font-medium text-[var(--yp-muted)]">
								Duration
							</td>
							<td className="px-6 py-4 text-[var(--yp-text-primary)]">
								{courseData.duration}
							</td>
						</tr>
						<tr>
							<td className="px-6 py-4 font-medium text-[var(--yp-muted)]">
								Best For
							</td>
							<td className="px-6 py-4 text-[var(--yp-text-primary)]">
								{getCategoryNamesFromBestFor(course?.best_for).join(", ")}
							</td>
						</tr>
						<tr className="bg-[var(--yp-secondary-alt)]">
							<td className="px-6 py-4 font-medium text-[var(--yp-muted)]">
								Course Eligibility
							</td>
							<td className="px-6 py-4 text-[var(--yp-text-primary)]">
								{courseData.course_eligibility}
							</td>
						</tr>
						<tr className="bg-[var(--yp-secondary-alt)]">
							<td className="px-6 py-4 font-medium text-[var(--yp-muted)]">
								Status
							</td>
							<td className="px-6 py-4 text-[var(--yp-text-primary)]">
								<Badge
									label={courseData.status}
									color={getStatusColor(courseData.status)}
								/>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
