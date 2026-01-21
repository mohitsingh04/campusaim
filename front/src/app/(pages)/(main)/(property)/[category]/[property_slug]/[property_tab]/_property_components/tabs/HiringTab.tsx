import {
  formatDate,
  generateSlug,
  isDateActive,
  stripHtmlAndLimit,
} from "@/context/Callbacks";
import { PropertyHiringProps } from "@/types/PropertyTypes";
import Badge from "@/ui/badge/Badge";
import Link from "next/link";
import {
  LuBadgeIndianRupee,
  LuBookOpen,
  LuCalendar,
  LuGraduationCap,
  LuUsers,
} from "react-icons/lu";

const HiringCard = ({ job }: { job: PropertyHiringProps }) => {
  const isActive = isDateActive(job.start_date, job.end_date);
  if (!isActive) return null;

  return (
    <div className="bg-(--secondary-bg) shadow-custom transition rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <Link
          href={`${process.env.NEXT_PUBLIC_CAREER_URL}/${generateSlug(
            job?.title
          )}/${job?._id}`}
          target="_blank"
        >
          <h3 className="text-xl font-bold text-(--text-color-emphasis)">
            {job.title || "Job Title"}
          </h3>
        </Link>
        <Badge label={job?.job_type} color="main" />
      </div>

      <p className="text-sm text-(--text-color)">
        {stripHtmlAndLimit(job?.job_description, 120)}
      </p>

      <div className="flex flex-wrap gap-4 text-sm text-(--text-color)">
        <div className="flex items-center gap-1">
          <LuUsers size={16} /> {job?.experience}
        </div>
        <div className="flex items-center gap-1">
          <LuBadgeIndianRupee size={16} />
          <div className="space-x-1">
            <span>{job?.salary?.INR}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <LuCalendar size={16} /> Apply end: {formatDate(job?.end_date || "")}
        </div>
      </div>

      <div>
        <h4 className="flex items-center gap-1 font-semibold text-sm mb-4 text-(--text-color-emphasis)">
          <LuBookOpen size={16} /> Skills
        </h4>
        <div className="flex flex-wrap gap-2">
          {job?.skills?.map((skill, idx) => (
            <Badge label={skill} color="gray" key={idx} />
          ))}
        </div>
      </div>

      <div>
        <h4 className="flex items-center gap-1 font-semibold text-sm mb-3 text-(--text-color-emphasis)">
          <LuGraduationCap size={16} /> Qualifications
        </h4>
        <div className="flex flex-wrap gap-2 uppercase">
          {job?.qualification?.map((q, idx) => (
            <Badge label={q} color="gray" key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Page
const HiringTab = ({ hiring }: { hiring: PropertyHiringProps[] }) => {
  return (
    <div className="px-0 md:px-4 md:py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {hiring?.map((job, idx) => (
          <HiringCard key={idx} job={job} />
        ))}
      </div>
    </div>
  );
};

export default HiringTab;
