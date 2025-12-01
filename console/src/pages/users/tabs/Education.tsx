import { CalendarDays, School } from "lucide-react";
import { MdSchool } from "react-icons/md";
import { AllDegreeAndInstituteProps, UserProps } from "../../../types/types";
import { formatDateWithoutTime } from "../../../contexts/Callbacks";

export default function ProfessionalEducation({
  professional,
  allDegreeAndInstitute,
}: {
  professional: UserProps | null;
  allDegreeAndInstitute: AllDegreeAndInstituteProps | null;
}) {
  const education = professional?.education || [];

  const getInstituteById = (id: number) => {
    const institute = allDegreeAndInstitute?.institute?.find(
      (item) => Number(item?.uniqueId) === Number(id)
    );
    return institute?.institute_name;
  };

  const getDegreeById = (id: number) => {
    const degree = allDegreeAndInstitute?.degree?.find(
      (item) => Number(item?.uniqueId) === Number(id)
    );
    return degree?.degree_name;
  };

  return (
    <div className="flex justify-center">
      <div className="w-full p-4 sm:p-6 relative">
        {/* Education List */}
        {education.length > 0 ? (
          <div className="space-y-6 sm:space-y-10">
            {education.map((edu, index) => (
              <div
                key={index}
                className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl bg-[var(--yp-secondary)] hover:shadow-lg transition-all duration-300"
              >
                {/* Icon badge */}
                <div className="p-3 sm:p-4 bg-[var(--yp-main-subtle)] rounded-xl shadow-sm flex-shrink-0">
                  <School className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--yp-main)]" />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-[var(--yp-text-primary)]">
                    {getDegreeById(edu.degree || 0)}
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--yp-main)] mt-1">
                    <span className="font-semibold">Institute:</span>{" "}
                    {getInstituteById(edu.institute || 0)}
                  </p>
                  <p className="flex items-center gap-2 text-sm sm:text-base text-[var(--yp-main)] mt-2 flex-wrap">
                    <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--yp-main)]" />
                    <span className="italic">
                      {formatDateWithoutTime(edu?.start_date)} -{" "}
                      {edu.currentlyStuding
                        ? "Present"
                        : formatDateWithoutTime(edu?.end_date)}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--yp-muted)]">
            <MdSchool className="w-20 h-20 mb-6 text-[var(--yp-muted)]" />
            <h3 className="text-xl sm:text-2xl font-semibold text-[var(--yp-text-primary)] mb-2">
              No Education Found
            </h3>
            <p>This user hasn't added any educational qualifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
