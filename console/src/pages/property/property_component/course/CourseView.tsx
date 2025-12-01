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
    course_level: string;
    course_slug: string;
    image: string[];
    status: string;
    certification_type: string;
    requirements: string[];
    best_for: string[];
    key_outcomes: string[];
    course_id: string;
  };
  getCourseById: (id: string) => any;
  setIsViewing: any;
  getCategoryById: (id: string) => any;
  requirements: ReqKoItem[];
  keyOutcomes: ReqKoItem[];
}

export default function CourseView({
  course,
  getCourseById,
  setIsViewing,
  requirements,
  keyOutcomes,
  getCategoryById,
}: CourseViewProps) {
  const masterCourse = getCourseById(course?.course_id);
  const getRequirementsByIds = useCallback(
    (ids: string[] = []) => {
      if (!Array.isArray(ids) || !requirements?.length) return [];
      return ids
        .map((id) => requirements.find((item) => item._id === id)?.requirment)
        .filter(Boolean);
    },
    [requirements]
  );

  const getKeyOutcomesByIds = useCallback(
    (ids: string[] = []) => {
      if (!Array.isArray(ids) || !keyOutcomes?.length) return [];
      return ids
        .map((id) => keyOutcomes.find((item) => item._id === id)?.key_outcome)
        .filter(Boolean);
    },
    [keyOutcomes]
  );

  const courseData = {
    name: course?.course_name || masterCourse?.course_name,
    shortName: course?.course_short_name || masterCourse?.course_short_name,
    type: course?.course_type || masterCourse?.course_type,
    duration: course?.duration || masterCourse?.duration,
    level: getCategoryById(course?.course_level || masterCourse?.course_level),
    status: course?.status || masterCourse?.status,
    certification: getCategoryById(
      course?.certification_type || masterCourse?.certification_type
    ),
    requirements: getRequirementsByIds(
      course?.requirements || masterCourse?.requirements
    ),
    bestFor: course?.best_for || masterCourse?.best_for,
    outcomes: getKeyOutcomesByIds(
      course?.key_outcomes || masterCourse?.key_outcomes
    ),
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
                {courseData.type}
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
                Course Level
              </td>
              <td className="px-6 py-4 text-[var(--yp-text-primary)]">
                {courseData.level}
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
            <tr>
              <td className="px-6 py-4 font-medium text-[var(--yp-muted)]">
                Certification Type
              </td>
              <td className="px-6 py-4 text-[var(--yp-text-primary)]">
                {courseData.certification}
              </td>
            </tr>
            <tr className="bg-[var(--yp-secondary-alt)]">
              <td className="px-6 py-4 font-medium text-[var(--yp-muted)]">
                Requirements
              </td>
              <td className="px-6 py-4 text-[var(--yp-text-primary)]">
                {courseData.requirements?.join(", ")}
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
                Key Outcomes
              </td>
              <td className="px-6 py-4 text-[var(--yp-text-primary)]">
                {courseData.outcomes?.join(", ")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
