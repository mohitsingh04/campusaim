import { useCallback } from "react";
import { getStatusColor } from "../../../../contexts/Callbacks";
import { ReqKoItem } from "../../../../types/types";
import Badge from "../../../../ui/badge/Badge";

interface CourseViewProps {
	course: {
		course_type: string;
		course_name: string;
		course_short_name: string;
		duration: string;
		description: string;
		course_slug: string;
		image: string[];
		degree_type: string;
		status: string;
		course_id: string;
		specialization: string[];
		specialization_fees: string[];
		program_type: string;
		prices?: any;
		best_for: string[];
		course_eligibility: string[];
	};
	getCourseById: (id: string) => any;
	setIsViewing: any;
	getCategoryById: (id: string) => any;
	prices?: any;
	bestFor: ReqKoItem[];
	courseEligibility: ReqKoItem[];
}

export default function CourseView({
	course,
	getCourseById,
	setIsViewing,
	getCategoryById,
	bestFor,
	courseEligibility,
}: CourseViewProps) {
	const masterCourse = getCourseById(course?.course_id);
	const getBestForByIds = useCallback(
		(ids: string[] = []) => {
			if (!Array.isArray(ids) || !bestFor?.length) return [];
			return ids
				.map((id) => bestFor.find((item) => item._id === id)?.best_for)
				.filter(Boolean);
		},
		[bestFor],
	);
	const getCourseEligibilityByIds = useCallback(
		(ids: string[] = []) => {
			if (!Array.isArray(ids) || !courseEligibility?.length) return [];
			return ids
				.map(
					(id) => courseEligibility.find((item) => item._id === id)?.course_eligibility,
				)
				.filter(Boolean);
		},
		[courseEligibility],
	);

	const courseData = {
		name: course?.course_name || masterCourse?.course_name,
		shortName: course?.course_short_name || masterCourse?.course_short_name,
		specializationFees: course?.specialization_fees || [],
		course_type: course?.course_type || masterCourse?.course_type,
		degree_type: course?.degree_type || masterCourse?.degree_type,
		program_type: course?.program_type || masterCourse?.program_type,
		duration: course?.duration || masterCourse?.duration,
		status: course?.status || masterCourse?.status,
		bestFor: getBestForByIds(course?.best_for || masterCourse?.best_for),
		courseEligibility: getCourseEligibilityByIds(
			course?.course_eligibility || masterCourse?.course_eligibility,
		),
	};

	const resolveCategoryName = (value: any) => {
		if (!value) return "-";

		if (typeof value === "object" && value._id) {
			return value.category_name || value.name || value._id;
		}

		if (typeof value === "string") {
			const cat = getCategoryById(value);
			if (!cat) return value;
			if (typeof cat === "object") {
				return cat.category_name || cat.name || cat._id;
			}
			return cat;
		}

		return "-";
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
								Course Type
							</td>
							<td className="px-6 py-4 text-[var(--yp-text-primary)]">
								{getCategoryById(course?.course_type)}
							</td>
						</tr>
						<tr>
							<td className="px-6 py-4 font-medium text-[var(--yp-muted)]">
								Degree Type
							</td>
							<td className="px-6 py-4 text-[var(--yp-text-primary)]">
								{getCategoryById(course?.degree_type)}
							</td>
						</tr>
						<tr>
							<td className="px-6 py-4 font-medium text-[var(--yp-muted)]">
								Program Type
							</td>
							<td className="px-6 py-4 text-[var(--yp-text-primary)]">
								{getCategoryById(course?.program_type)}
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
								{courseData.bestFor?.join(", ")}
							</td>
						</tr>
						<tr className="bg-[var(--yp-secondary-alt)]">
							<td className="px-6 py-4 font-medium text-[var(--yp-muted)]">
								Course Eligibility
							</td>
							<td className="px-6 py-4 text-[var(--yp-text-primary)]">
								{courseData.bestFor?.join(", ")}
							</td>
						</tr>

						<tr>
							<td className="px-6 py-4 font-medium">Specializations & Fees</td>
							<td className="px-6 py-4 space-y-1">
								{courseData.specializationFees.length > 0 ? (
									courseData.specializationFees.map((s: any, idx: any) => (
										<div key={idx} className="flex justify-between gap-4">
											<span>{resolveCategoryName(s.specialization_id)}</span>
											<span className="font-medium">
												{s.fees?.currency} {s.fees?.tuition_fee}
											</span>
										</div>
									))
								) : (
									<span>-</span>
								)}
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
